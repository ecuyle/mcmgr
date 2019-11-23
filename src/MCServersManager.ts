import {
    writeFileSync,
    createWriteStream,
    WriteStream,
} from 'fs';
import axios, { AxiosResponse } from 'axios';
import { mkdir } from 'shelljs';
import * as moment from 'moment';
import { MCVersionsManager } from './MCVersionsManager';
import { copy, generateUniqueId } from './utils.js';
import { MCVMInterface, VersionManifest } from '../types/MCVersionsManager';
import { MCSMInterface, ServerConfig } from '../types/MCServersManager';
import { MCFMInterface, ServerSchemaObject } from '../types/MCFileManager';
import { VersionDownloadDetails } from '../types/Common';
import { DEFAULT_SERVER_PROPERTIES } from '../templates/template.server.properties';
import { DEFAULT_EULA_ROWS } from '../templates/template.eula';
import * as path from 'path';
import { MCEventBusInterface, MCEvent } from '../types/MCEventBus';
import { topics } from './pubsub/topics';

export class MCServersManager implements MCSMInterface {
    public static BASE_PATH: string = path.join(__dirname, '..', '..', 'data');
    public static EULA_FILENAME: string = 'eula.txt';
    public static SERVER_PROPERTIES_FILENAME: string = 'server.properties';
    public static MCVM: MCVMInterface = new MCVersionsManager();

    public mcfm: MCFMInterface;
    public eventBus: MCEventBusInterface;

    public constructor(mcfm: MCFMInterface, eventBus: MCEventBusInterface) {
        this.mcfm = mcfm;
        this.eventBus = eventBus;

        eventBus.subscribe(topics.SERVER_START, this.startServer.bind(this));
    }

    public startServer(event: MCEvent): boolean {
        console.log(event);
        return true;
    }

    public async createServer(name: string, runtime: string, isEulaAccepted: boolean = false, userId: number, config: ServerConfig = {}): Promise<number> {
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

            return server.id;
        } catch (e) {
            return e;
        }
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
