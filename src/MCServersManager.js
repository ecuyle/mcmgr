const fs = require('fs');
const axios = require('axios');
const sh = require('shelljs');
const { MCVersionsManager } = require('./MCVersionsManager.js');
const moment = require('moment');
const DEFAULT_SERVER_PROPERTIES = require('../templates/template.server.properties.js');
const { shallowCopy } = require('./utils.js');

const BASE_PATH = '/home/ecuyle/Code/mcmgr';
const TEMPLATES_BASE = '/templates';
const EULA_TEMPLATE_FILENAME = 'template.eula.txt';
const EULA_FILENAME = 'eula.txt';
const SERVER_PROPERTIES_FILENAME = 'server.properties';

const mcvm = new MCVersionsManager();

class MCServersManager {
    constructor(serverId) {
        this.serverId = serverId;
        this.name = '';
        this.runtime = '';
        this.config = {};
        this.isEulaAccepted = false;
        this.serverDirPath = '';
        this._setServerPropsIfExists();
        this.eulaTemplatePath = `${BASE_PATH}${TEMPLATES_BASE}/${EULA_TEMPLATE_FILENAME}`;
    }

    async createServer(name, runtime, isEulaAccepted = false, config = {}) {
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
            this.serverDirPath = `${BASE_PATH}/${this.name}`;
            this.mcvm = new MCVersionsManager(this.runtime);

            sh.mkdir(this.serverDirPath);
            await this._downloadServerRuntime();
            this._copyTemplatesIntoServerDirWithData();

            return true;
        } catch(e) {
            throw new Error(e);
        }
    }

    _createEulaWithUserInput() {
        const eulaFile = fs.readFileSync(this.eulaTemplatePath).toString().split('\n');
        const expectedEULALineIndex = 2;
        const expectedEULALineText = 'eula=false';
        const newEULALineText = `eula=${this.isEulaAccepted}`;
        const eulaDest = `${this.serverDirPath}/${EULA_FILENAME}`;

        if (eulaFile[expectedEULALineIndex] === expectedEULALineText) {
            eulaFile[expectedEULALineIndex] = newEULALineText;
        } else {
            eulaFile.forEach((line, i) => {
                if (line === expectedEULALineText) {
                    eulaFile[i] = newEULALineText;
                }
            });
        }

        const data = new Uint8Array(Buffer.from(eulaFile.join('\n')));
        fs.writeFileSync(eulaDest, data);
        return;
    }

    _createServerPropertiesWithConfig() {
        const defaultsCopy = shallowCopy(DEFAULT_SERVER_PROPERTIES);
        this._updateDefaultServerPropertiesWithConfig(defaultsCopy);

        const defaultsCopyArray = ['#Minecraft server properties', `#${moment().format('LLLL')}`];
        Object.keys(defaultsCopy).forEach(key => {
            defaultsCopyArray.push(`${key}=${defaultsCopy[key]}`);
        });

        const data = new Uint8Array(Buffer.from(defaultsCopyArray.join('\n')));
        const serverDest = `${this.serverDirPath}/${SERVER_PROPERTIES_FILENAME}`;

        fs.writeFileSync(serverDest, data);

        return;
    }

    _updateDefaultServerPropertiesWithConfig(defaultsCopy) {
        Object.keys(this.config).forEach(property => {
            if (defaultsCopy[property]) {
                defaultsCopy[property] = this.config[property];
            }
        });
    }

    _setServerPropsIfExists() {
        
    }

    _copyTemplatesIntoServerDirWithData() {
        this._createEulaWithUserInput();
        this._createServerPropertiesWithConfig();
    }

    async _downloadServerRuntime() {
        try {
            const url = await this._getServerRuntimeUrl();
            const { data } = await axios({
                method: 'GET',
                url: url,
                responseType: 'stream',
            });
            const runtimeJar = fs.createWriteStream(`${this.serverDirPath}/minecraft-server-${this.runtime}.jar`);
            data.pipe(runtimeJar);
            return true;
        } catch(e) {
            throw new Error(e);
        }
    }

    async _getServerRuntimeUrl() {
        try {
            const { downloads } = await mcvm.getVersionManifest(this.runtime);
            if (downloads && downloads.server) {
                const { url } = downloads.server;
                return url;
            } else {
                throw new Error('FATAL INTERNAL :: _getServerRuntimeUrl :: Server list from mojang did not return a server runtime url');
            }
        } catch(e) {
            throw new Error(e);
        }
    }
}

module.exports = MCServersManager;
