const fs = require('fs');
const axios = require('axios');
const { mkdir } = require('./utils.js');
const MCVersionsManager = require('./MCVersionsManager.js');

const BASE_PATH = '/home/ecuyle/Code/mcmgr';
const mcvm = new MCVersionsManager();

class MCServersManager {
    constructor() {
        
    }

    createServer(name, runtime, config) {
        return new Promise((resolve, reject) => {
            const serverDirPath = `${BASE_PATH}/${name}`;
            mkdir(serverDirPath)
                .then(() => {
                    return this.downloadServerRuntime(serverDirPath, runtime);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    downloadServerRuntime(serverDirPath, runtime) {
        return new Promise((resolve, reject) => {
            this.getServerRuntimeUrl(runtime)
                .then(url => {
                    return axios({
                        method: 'GET',
                        url: url,
                        responseType: 'stream',
                    });
                })
                .then(({ data }) => {
                    const runtimeJar = fs.createWriteStream(`${serverDirPath}/minecraft-server-${runtime}.jar`);
                    data.pipe(runtimeJar);
                })
                .catch(err => reject(err));
        });
    }

    getServerRuntimeUrl(runtime) {
        return new Promise((resolve, reject) => {
            mcvm.getVersionManifest(runtime)
                .then(manifest => {
                    if (manifest.downloads && manifest.downloads.server) {
                        const { url } = manifest.downloads.server;
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
