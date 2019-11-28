import {
    readdirSync,
    writeFileSync,
    createWriteStream,
    WriteStream,
} from 'fs';
import axios, { AxiosResponse } from 'axios';
import { mkdir, exec, cd } from 'shelljs';
import * as shell from 'shell-escape-tag';
import * as moment from 'moment';
import { MCVersionsManager } from './MCVersionsManager';
import { copy, generateUniqueId, isUndefinedOrNull } from '../utils.js';
import { MCVMInterface, VersionManifest } from '../../types/MCVersionsManager';
import { MCSMInterface, ServerConfig, ServersList, ServerDetails } from '../../types/MCServersManager';
import { MCFMInterface, ServerSchemaObject } from '../../types/MCFileManager';
import { VersionDownloadDetails } from '../../types/Common';
import { DEFAULT_SERVER_PROPERTIES } from '../../templates/template.server.properties';
import { DEFAULT_EULA_ROWS } from '../../templates/template.eula';
import * as path from 'path';
import { MCEventBusInterface, MCEvent } from '../../types/MCEventBus';
import { topics } from '../pubsub/topics';
import { ChildProcess } from 'child_process';

export class MCServersManager implements MCSMInterface {
    public static BASE_PATH: string = path.join(__dirname, '..', '..', '..', '..', 'data');
    public static EULA_FILENAME: string = 'eula.txt';
    public static SERVER_PROPERTIES_FILENAME: string = 'server.properties';
    public static MCVM: MCVMInterface = new MCVersionsManager();

    private _eventBus: MCEventBusInterface;

    public mcfm: MCFMInterface;
    public activeServers: ServersList;

    public constructor(mcfm: MCFMInterface, eventBus: MCEventBusInterface) {
        this.mcfm = mcfm;
        this._eventBus = eventBus;
        this.activeServers = {};

        this._eventBus.subscribe(topics.SERVER_START, this.startServer.bind(this));
        this._eventBus.subscribe(topics.SERVER_STOP, this.stopServer.bind(this));
        this._eventBus.subscribe(topics.ISSUE_COMMAND, this.issueCommand.bind(this));
    }

    public getServerDetails(serverId: number): ServerDetails {
        try {
            const server: ServerSchemaObject | void = this.mcfm.getOneById<ServerSchemaObject>('servers', serverId);

            if (!server || server.id === undefined || server.id === null) {
                throw new Error(`Server with serverId ${serverId} does not exist.`);
            }

            const {
                id,
                path,
                runtime,
                name,
            }: ServerSchemaObject = server;

            return {
                config: this._getServerProps(path),
                isEulaAccepted: this._getEulaAcceptanceStatus(path),
                id,
                path,
                runtime,
                name,
            };

        } catch(e) {
            return e;
        }
    }

    public startServer(event: MCEvent): boolean {
        const { payload: { serverId }, successCallback, errorCallback }: MCEvent = event;

        if (!successCallback || !errorCallback) {
            throw new Error('FATAL INTERNAL :: successCallback and errorCallback are required');
        }

        if (typeof parseInt(serverId) !== 'number') {
            errorCallback(new Error(`Start server request failed due to invalid serverId '${serverId}'`));
            delete event.errorCallback;
            return false;
        }

        const server: ServerSchemaObject | void = this.mcfm.getOneById<ServerSchemaObject>('servers', serverId);

        if (!server) {
            errorCallback(new Error(`Start server request failed due to server not found with serverId '${serverId}'`));
            delete event.errorCallback;
            return false;
        }

        const { path, runtime }: ServerSchemaObject = server;
        const serverFiles: Array<string> = readdirSync(path);
        const jarfile: string | undefined = serverFiles.find(file => {
            return !!file.match(new RegExp(`${runtime}.jar$`));
        });

        if (!jarfile) {
            throw new Error(`FATAL INTERNAL :: MCSM.startServer :: Jarfile for server at ${path} could not be found.`)
        }

        cd(path);
        const startServerCommand = shell`java -Xmx1G -Xmx1G -jar ${path}/${jarfile} nogui`;
        const child: ChildProcess = exec(startServerCommand, { async: true });

        if (!child || !child.stdout) {
            throw new Error(`Server start failed at path ${path}`);
        }

        const { pid }: ChildProcess = child;

        child.stdout.on('data', data => {
            console.log(data);
        });

        if (this.activeServers[pid]) {
            const stopServerEvent: MCEvent = this._eventBus.createEvent(topics.SERVER_STOP, { pid });
            this._eventBus.publish(stopServerEvent);
        }

        this.activeServers[pid] = child;

        if (successCallback) {
            successCallback({ message: `Server successfully started with process ${pid}`, pid, event });
            delete event.successCallback;
        }

        return true;
    }

    public stopServer(event: MCEvent): boolean {
        const { payload: { pid }, successCallback, errorCallback }: MCEvent = event;

        if (!successCallback || !errorCallback) {
            throw new Error('FATAL INTERNAL :: successCallback and errorCallback are required');
        }

        if (typeof parseInt(pid) !== 'number') {
            errorCallback(new Error(`Stop server request failed due to invalid pid '${pid}'`));
            delete event.errorCallback;
            return false;
        }

        const stopServerEvent: MCEvent = this._eventBus.createEvent(topics.ISSUE_COMMAND, { command: 'stop', pid }, successCallback, errorCallback);
        this._eventBus.publish(stopServerEvent);
        delete this.activeServers[pid];
        delete event.successCallback;
        delete event.errorCallback;

        return true;
    }

    public issueCommand(event: MCEvent): boolean {
        const { payload: { pid, command }, successCallback, errorCallback }: MCEvent = event;

        if (!successCallback || !errorCallback) {
            throw new Error('FATAL INTERNAL :: successCallback and errorCallback are required');
        }

        if (typeof parseInt(pid) !== 'number' || !command) {
            errorCallback(new Error(`Issue command request failed due to invalid pid (${pid}) or command (${command})`));
            delete event.errorCallback;
            return false;
        }

        const child = this.activeServers[pid];

        if (!child || !child.stdin) {
            throw new Error(`Issue command failed at pid ${pid}`)
        }

        const escapedCommand: string = shell.escape(command);
        child.stdin.write(`${escapedCommand}\n`);

        if (escapedCommand === 'stop') {
            delete this.activeServers[pid];
        }

        if (successCallback) {
            successCallback({ message: `Command '${escapedCommand}' issued successfully.`, pid, event });
            delete event.successCallback;
        }

        return true;
    }

    public async updateServerConfig(serverId: number, newConfig: ServerConfig): Promise<ServerConfig> {
        // TODO: add prop validation on server config (ie. if someone sends a difficulty of "uber hard", do we throw an unsupported error?)
        const nullServerHandler = () => {
            throw new Error(`FATAL INTERNAL :: MCSM._getServerFromId :: serverId '${serverId}' is invalid`);
        };
        const { path: serverDirPath }: ServerSchemaObject = this._getServerFromId(serverId, nullServerHandler);
        await this._createServerPropertiesWithConfig(serverDirPath, newConfig);

        return newConfig;
    }

    public async createServer(name: string, runtime: string, isEulaAccepted: boolean = false, userId: number, config: ServerConfig = {}): Promise<ServerSchemaObject> {
        try {
            if (!name) {
                throw new Error('FATAL EXTERNAL :: createServer :: User must provide server name');
            }

            if (!runtime) {
                throw new Error('FATAL EXTERNAL :: createServer :: User must provide server runtime');
            }

            if (!isEulaAccepted) {
                throw new Error('FATAL EXTERNAL :: createServer :: User must accept EULA to proceed');
            }

            if (userId === undefined) {
                throw new Error('FATAL EXTERNAL :: createServer :: User must provide userId');
            }

            const uniquePathName = generateUniqueId();
            const serverDirPath = `${MCServersManager.BASE_PATH}/${uniquePathName}`;

            mkdir(serverDirPath);
            await this._downloadServerRuntime(serverDirPath, runtime);
            this._copyTemplatesIntoServerDirWithData(serverDirPath, isEulaAccepted, config);

            const newServer: ServerSchemaObject = {
                fk_users_id: userId,
                name,
                runtime,
                path: serverDirPath,
            };

            const server: ServerSchemaObject = this.mcfm.updateOrAdd<ServerSchemaObject>('servers', newServer);

            if (isUndefinedOrNull(server)) {
                throw new Error(`FATAL INTERNAL :: MCSM.createServer :: Error creating server at ${serverDirPath}`);
            }

            return server;
        } catch (e) {
            throw e;
        }
    }

    private _getServerFromId(serverId: number, nullServerHandler: Function): ServerSchemaObject {
        try {
            const server: ServerSchemaObject | void = this.mcfm.getOneById<ServerSchemaObject>('servers', serverId);

            if (!server) {
                return nullServerHandler();
            }

            return server;
        } catch(e) {
            return e;
        }
    }

    private _getEulaAcceptanceStatus(serverDirPath: string): boolean {
        const eulaFilePath: string = `${serverDirPath}/${MCServersManager.EULA_FILENAME}`;
        return this.mcfm
            .getFileContents(eulaFilePath)
            .includes('true');
    }

    private _getServerProps(serverDirPath: string): ServerConfig {
        try {
            const serverPropsFilePath = `${serverDirPath}/${MCServersManager.SERVER_PROPERTIES_FILENAME}`;
            const configContents = this.mcfm.getFileContents(serverPropsFilePath);
            return this._parseServerProps(configContents);
        } catch(e) {
            return e;
        }
    }

    private _parseServerProps(configContents: string): ServerConfig {
        return configContents
            .split('\n')
            .reduce((acc: ServerConfig, curr: string) => {
                if (curr[0] !== '#') {
                    const [key, value] = curr.split('=');
                    acc[key] = value;
                }

                return acc;
            }, {});
    }

    private _createEulaWithUserInput(serverDirPath: string, isEulaAccepted: boolean): void {
        const eulaFile: Array<string> = copy(DEFAULT_EULA_ROWS);
        const eulaAcceptanceString: string = `eula=${isEulaAccepted}`;
        const eulaDest: string = `${serverDirPath}/${MCServersManager.EULA_FILENAME}`;

        eulaFile[1] = `#${moment().format('LLLL')}`;
        eulaFile[2] = eulaAcceptanceString;

        const data: Uint8Array = new Uint8Array(Buffer.from(eulaFile.join('\n')));
        writeFileSync(eulaDest, data);
        return;
    }

    private async _createServerPropertiesWithConfig(serverDirPath: string, config: ServerConfig): Promise<void> {
        const defaultsCopy: ServerConfig = copy(DEFAULT_SERVER_PROPERTIES);
        this._updateDefaultServerPropertiesWithConfig(defaultsCopy, config);

        const defaultsCopyArray: Array<string> = ['#Minecraft server properties', `#${moment().format('LLLL')}`];
        Object.keys(defaultsCopy).forEach((key: string) => {
            defaultsCopyArray.push(`${key}=${defaultsCopy[key]}`);
        });

        const data: Uint8Array = new Uint8Array(Buffer.from(defaultsCopyArray.join('\n')));
        const serverDest: string = `${serverDirPath}/${MCServersManager.SERVER_PROPERTIES_FILENAME}`;

        writeFileSync(serverDest, data);

        return;
    }

    private _updateDefaultServerPropertiesWithConfig(defaultsCopy: ServerConfig, config: ServerConfig): void {
        Object.keys(config).forEach((property: string) => {
            if (defaultsCopy[property]) {
                defaultsCopy[property] = config[property];
            }
        });
    }

    private _copyTemplatesIntoServerDirWithData(serverDirPath: string, isEulaAccepted: boolean, config: ServerConfig): void {
        this._createEulaWithUserInput(serverDirPath, isEulaAccepted);
        this._createServerPropertiesWithConfig(serverDirPath, config);
    }

    private async _downloadServerRuntime(serverDirPath: string, runtime: string): Promise<boolean> {
        try {
            const url: string = await this._getServerRuntimeUrl(runtime);

            const { data }: AxiosResponse = await axios({
                method: 'GET',
                url: url,
                responseType: 'stream',
            });

            const runtimeJarStream: WriteStream = createWriteStream(`${serverDirPath}/minecraft-server-${runtime}.jar`);
            data.pipe(runtimeJarStream);

            return true;
        } catch (e) {
            throw new Error(e);
        }
    }

    private async _getServerRuntimeUrl(runtime: string): Promise<string> {
        try {
            const { downloads }: VersionManifest = await MCServersManager.MCVM.getVersionManifest(runtime);
            if (downloads && downloads.server) {
                const { url }: VersionDownloadDetails = downloads.server;
                return url;
            } else {
                throw new Error('FATAL INTERNAL :: _getServerRuntimeUrl :: Server list from mojang did not return a server runtime url');
            }
        } catch (e) {
            throw new Error(e);
        }
    }
}
