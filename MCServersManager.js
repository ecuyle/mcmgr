const fs = require('fs');
const axios = require('axios');
const sh = require('shelljs');
const { mkdir } = require('./utils.js');
const MCVersionsManager = require('./MCVersionsManager.js');

const BASE_PATH = '/home/ecuyle/Code/mcmgr';
const TEMPLATES_BASE = '/templates';
const EULA_TEMPLATE_FILENAME = 'template.eula.txt';
const SERVER_PROPERTIES_TEMPLATE_FILENAME = 'template.server.properties';
const EULA_FILENAME = 'eula.txt';
const SERVER_PROPERTIES_FILENAME = 'server.properties';

const mcvm = new MCVersionsManager();

class MCServersManager {
    constructor(serverId) {
        console.log('inside the constructor');
        this.serverId = serverId;
        this.name = '';
        this.runtime = '';
        this.config = {};
        this.isEulaAccepted = false;
        this.serverDirPath = '';
        this._setServerPropsIfExists();
        this.eulaTemplatePath = `${BASE_PATH}${TEMPLATES_BASE}/${EULA_TEMPLATE_FILENAME}`;
        this.serverPropertiesTemplatePath = `${BASE_PATH}${TEMPLATES_BASE}/${SERVER_PROPERTIES_TEMPLATE_FILENAME}`;
    }

    async createServer(name, runtime, isEulaAccepted = false, config = {}) {
        try {
            if (this.serverId) {
                throw new Error('FATAL INTERNAL: Server Id already exists on this manager. Cannot create new server with this manager');
            }

            if (!name) {
                throw new Error('FATAL EXTERNAL: User must provide server name');
            }

            if (!runtime) {
                throw new Error('FATAL EXTERNAL: User must provide server runtime');
            }

            if (!isEulaAccepted) {
                throw new Error('FATAL EXTERNAL: User must accept EULA to proceed');
            }

            this.name = name;
            this.runtime = runtime;
            this.config = config;
            this.isEulaAccepted = isEulaAccepted;
            this.serverDirPath = `${BASE_PATH}/${this.name}`;
            this.mcvm = new MCVersionsManager(this.runtime);

            sh.mkdir(this.serverDirPath);
            console.log('downloading server runtime');
            await this._downloadServerRuntime();
            console.log('now doing copying');
            this._copyTemplatesIntoServerDirWithData();

            return true;
        } catch(e) {
            console.log(e);
            return e;
        }
    }

    async _createEulaWithUserInput() {
        const eulaFile = await fs.readFile(this.eulaTemplatePath);
        console.log(eulaFile);
    }

    _createServerPropertiesWithConfig() {
       
    }

    _setServerPropsIfExists() {
        
    }

    _copyTemplatesIntoServerDirWithData() {
        this._createEulaWithUserInput();
        this._createServerPropertiesWithConfig();
    }

    _downloadServerRuntime() {
        return new Promise((resolve, reject) => {
            this._getServerRuntimeUrl()
                .then(url => {
                    return axios({
                        method: 'GET',
                        url: url,
                        responseType: 'stream',
                    });
                })
                .then(({ data }) => {
                    const runtimeJar = fs.createWriteStream(`${this.serverDirPath}/minecraft-server-${this.runtime}.jar`);
                    data.pipe(runtimeJar);
                    console.log('done piping');
                })
                .catch(err => reject(err));
        });
    }

    _getServerRuntimeUrl() {
        return new Promise((resolve, reject) => {
            mcvm.getVersionManifest(this.runtime)
                .then(({ downloads })=> {
                    if (downloads && downloads.server) {
                        const { url } = downloads.server;
                        resolve(url);
                    } else {
                        reject(null);
                    }
                })
                .catch(err => reject(err));
        });
    }
}

module.exports = MCServersManager;
