import {
    writeFileSync,
    createWriteStream,
    WriteStream,
} from 'fs';
import axios, { AxiosResponse } from 'axios';
import { mkdir } from 'shelljs';
import * as moment from 'moment';
import { MCVersionsManager } from './MCVersionsManager';
import { shallowCopy } from './utils.js';
import { MCVMInterface, VersionManifest } from '../types/MCVersionsManager';
import { MCSMInterface, ServerConfig } from '../types/MCServersManager';
import { VersionDownloadDetails } from '../types/Common';
import { DEFAULT_SERVER_PROPERTIES } from '../templates/template.server.properties';
import { DEFAULT_EULA_ROWS } from '../templates/template.eula';

export class MCServersManager implements MCSMInterface {
    public static BASE_PATH: string = '/home/ecuyle/Code/mcmgr';
    public static EULA_FILENAME: string = 'eula.txt';
    public static SERVER_PROPERTIES_FILENAME: string = 'server.properties';
    public static MCVM: MCVMInterface = new MCVersionsManager(); 

    public serverId: number;
    public name: string;
    public runtime: string;
    public config: ServerConfig;
    public isEulaAccepted: boolean;
    public serverDirPath: string;

    public constructor(serverId?: number) {
        this.serverId = serverId;
        this.name = '';
        this.runtime = '';
        this.config = {};
        this.isEulaAccepted = false;
        this.serverDirPath = '';
        this._setServerPropsIfExists();
    }

    public async createServer(name: string, runtime: string, isEulaAccepted: boolean = false, config: ServerConfig = {}): Promise<boolean> {
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

            this.name = name;
            this.runtime = runtime;
            this.config = config;
            this.isEulaAccepted = isEulaAccepted;
            this.serverDirPath = `${MCServersManager.BASE_PATH}/${name}`;

            mkdir(this.serverDirPath);
            await this._downloadServerRuntime();
            this._copyTemplatesIntoServerDirWithData();

            return true;
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

    private _setServerPropsIfExists() {

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
