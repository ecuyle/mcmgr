import axios, { AxiosResponse } from 'axios';
import {
    MCVMInterface,
    VersionsManifest,
    VersionDetails,
    VersionsDict,
    VersionManifest,
} from '../declarations/MCVersionsManager';

const VERSION_MANIFEST_BASE: string = 'https://launchermeta.mojang.com/mc/game/version_manifest.json';

export class MCVersionsManager implements MCVMInterface {
    private async _getVersionsManifest(): Promise<VersionsManifest> {
        try {
            const { data }: AxiosResponse<VersionsManifest> = await axios.get(VERSION_MANIFEST_BASE);

            return data;
        } catch(e) {
            return e;
        }
    }

    private async _createVersionsDict(): Promise<VersionsDict> {
        try {
            const { versions }: VersionsManifest = await this._getVersionsManifest();
            const versionsDict: VersionsDict = {};

            versions.forEach((version: VersionDetails) => {
                versionsDict[version.id] = version;
            });

            return versionsDict;
        } catch(e) {
            return e;
        }
    }

    private async _getVersionDetails(runtime: string): Promise<VersionDetails> {
        try {
            const dict: VersionsDict = await this._createVersionsDict();

            if (dict[runtime]) {
                return dict[runtime];
            }
            
            throw new Error('FATAL EXTERNAL :: _getVersionDetails :: Provided runtime does not exist');
        } catch(e) {
            return e;
        }
    }

    public async getVersionManifest(runtime: string): Promise<VersionManifest> {
        try {
            const versionDetails: VersionDetails = await this._getVersionDetails(runtime);
            const { url }: VersionDetails = versionDetails;
            const { data }: AxiosResponse<VersionManifest> = await axios.get(url);

            return data;
        } catch(e) {
            return e;
        }
    }
}
