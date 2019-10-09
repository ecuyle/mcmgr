const axios = require('axios');

const VERSION_MANIFEST_BASE = 'https://launchermeta.mojang.com/mc/game/version_manifest.json';

class MCVersionsManager {
    getVersionsManifest() {
        return new Promise((resolve, reject) => {
            axios.get(VERSION_MANIFEST_BASE)
                .then(({ data }) => {
                    resolve(data);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    createVersionsDict() {
        return new Promise((resolve, reject) => {
            this.getVersionsManifest()
                .then(({ versions }) => {
                    const versionsDict = {};

                    versions.forEach(version => {
                        versionsDict[version.id] = version;
                    });

                    resolve(versionsDict);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    getVersionDetails(runtime) {
        return new Promise((resolve, reject) => {
            this.createVersionsDict()
                .then(dict => {
                    resolve(dict[runtime] || {});
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    getVersionManifest(runtime) {
        return new Promise((resolve, reject) => {
            this.getVersionDetails(runtime)
                .then(versionDetails => {
                    const url = versionDetails.url || null;
                    return axios.get(url);
                })
                .then(({ data }) => resolve(data))
                .catch(err => {
                    reject(err);
                });
        });
    }
}

module.exports = MCVersionsManager;
