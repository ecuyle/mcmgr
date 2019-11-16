import {
    writeFileSync,
    createWriteStream,
    WriteStream,
} from 'fs';
import axios, { AxiosResponse } from 'axios';
import { mkdir } from 'shelljs';
import * as moment from 'moment';
import { MCVersionsManager } from './MCVersionsManager';
import { shallowCopy, generateUniqueId } from './utils.js';
import { MCVMInterface, VersionManifest } from '../types/MCVersionsManager';
import { MCSMInterface, ServerConfig } from '../types/MCServersManager';
import { MCFMInterface, ServerSchemaObject } from '../types/MCFileManager';
import { VersionDownloadDetails } from '../types/Common';
import { DEFAULT_SERVER_PROPERTIES } from '../templates/template.server.properties';
import { DEFAULT_EULA_ROWS } from '../templates/template.eula';
import * as path from 'path';

export class MCServersManager implements MCSMInterface {
    public static BASE_PATH: string = path.join(__dirname, '..', '..', 'data');
    public static EULA_FILENAME: string = 'eula.txt';
    public static SERVER_PROPERTIES_FILENAME: string = 'server.properties';
    public static MCVM: MCVMInterface = new MCVersionsManager(); 

    public serverId: number;
    public name: string;
    public runtime: string;
    public config: ServerConfig;
    public isEulaAccepted: boolean;
    public serverDirPath: string;
    public userId: number;
    public mcfm: MCFMInterface;

    public constructor(mcfm: MCFMInterface, serverId?: number) {
        this.serverId = serverId;
        this.mcfm = mcfm;
        this.config = {};
        this.isEulaAccepted = false;
        this.serverDirPath = '';

        this._setServerPropsIfExists();
    }

    public async createServer(name: string, runtime: string, isEulaAccepted: boolean = false, userId: number, config: ServerConfig = {}): Promise<number> {
        try {
            if (this.serverId) {
                throw new Error('FATAL INTERNAL :: createServer :: Server Id already exists on this manager. Cannot create new server with this manager');
            }

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

            this.name = name;
            this.runtime = runtime;
            this.config = config;
            this.isEulaAccepted = isEulaAccepted;
            this.serverDirPath = `${MCServersManager.BASE_PATH}/${uniquePathName}`;

            mkdir(this.serverDirPath);
            await this._downloadServerRuntime();
            this._copyTemplatesIntoServerDirWithData();

            console.log(userId);
            const newServer: ServerSchemaObject = {
                fk_users_id: userId,
                name: name,
                runtime: runtime,
                path: this.serverDirPath,
            };

            const server: ServerSchemaObject = this.mcfm.updateOrAdd<ServerSchemaObject>('servers', newServer);
            this.serverId = server.id;

            return this.serverId;
        } catch (e) {
            return e;
        }
    }

    private _createEulaWithUserInput(): void {
        const eulaFile: Array<string> = shallowCopy(DEFAULT_EULA_ROWS);
        const eulaAcceptanceString: string = `eula=${this.isEulaAccepted}`;
        const eulaDest: string = `${this.serverDirPath}/${MCServersManager.EULA_FILENAME}`;

        eulaFile[1] = `#${moment().format('LLLL')}`;
        eulaFile[2] = eulaAcceptanceString;

        const data: Uint8Array = new Uint8Array(Buffer.from(eulaFile.join('\n')));
        writeFileSync(eulaDest, data);
        return;
    }

    private async _createServerPropertiesWithConfig(): Promise<void> {
        const defaultsCopy: ServerConfig = shallowCopy(DEFAULT_SERVER_PROPERTIES);
        this._updateDefaultServerPropertiesWithConfig(defaultsCopy);

        const defaultsCopyArray: Array<string> = ['#Minecraft server properties', `#${moment().format('LLLL')}`];
        Object.keys(defaultsCopy).forEach((key: string) => {
            defaultsCopyArray.push(`${key}=${defaultsCopy[key]}`);
        });

        const data: Uint8Array = new Uint8Array(Buffer.from(defaultsCopyArray.join('\n')));
        const serverDest: string = `${this.serverDirPath}/${MCServersManager.SERVER_PROPERTIES_FILENAME}`;

        writeFileSync(serverDest, data);

        return;
    }

    private _updateDefaultServerPropertiesWithConfig(defaultsCopy: ServerConfig): void {
        Object.keys(this.config).forEach((property: string) => {
            if (defaultsCopy[property]) {
                defaultsCopy[property] = this.config[property];
            }
        });
    }

    private _setServerPropsIfExists(): void {
        const { serverId } = this;

        if (serverId === undefined) {
            return;
        }

        const serverData: ServerSchemaObject | void = this.mcfm.getOneById<ServerSchemaObject>('servers', serverId);

        if (!serverData) {
            throw new Error(`FATAL :: _setServerPropsIfExsts :: Server Id ${serverId} was not found`);
        }

        this.name = serverData.name;
        this.runtime = serverData.runtime;
        this.serverDirPath = serverData.path;

        // TODO: get config from file
    }

    private _copyTemplatesIntoServerDirWithData(): void {
        this._createEulaWithUserInput();
        this._createServerPropertiesWithConfig();
    }

    private async _downloadServerRuntime(): Promise<boolean> {
        try {
            const url: string = await this._getServerRuntimeUrl();

            const { data }: AxiosResponse = await axios({
                method: 'GET',
                url: url,
                responseType: 'stream',
            });

            const runtimeJarStream: WriteStream = createWriteStream(`${this.serverDirPath}/minecraft-server-${this.runtime}.jar`);
            data.pipe(runtimeJarStream);

            return true;
        } catch (e) {
            throw new Error(e);
        }
    }

    async _getServerRuntimeUrl(): Promise<string> {
        try {
            const { downloads }: VersionManifest = await MCServersManager.MCVM.getVersionManifest(this.runtime);
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
