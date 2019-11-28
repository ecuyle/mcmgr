import axios, { AxiosResponse } from 'axios';
import {
    MCVMInterface,
    VersionsManifest,
    VersionDetails,
    VersionsDict,
    VersionManifest,
} from '../../../types/MCVersionsManager';

const VERSION_MANIFEST_BASE: string = 'https://launchermeta.mojang.com/mc/game/version_manifest.json';

export class MCVersionsManager implements MCVMInterface {
    /**
     * Queries the Mojang versions manifest API to retrieve all Minecraft version manifests
     *
     * @returns Promise<VersionsManifest> - VersionsManifest is an array of VersionDetails
     *      which represents all historical Minecraft version manifests.
     * @error is returned if the GET request to the VERSIONS_MANIFEST_BASE fails.
     *
     * @note - Version manifests are important because they contain .jar download urls that
     *      will later be used to download server.jar files.
     */
    private async _getVersionsManifest(): Promise<VersionsManifest> {
        try {
            const { data }: AxiosResponse<VersionsManifest> = await axios.get(VERSION_MANIFEST_BASE);

            return data;
        } catch(e) {
            return e;
        }
    }

    /**
     * Creates a dictionary where keys are runtime strings and values are VersionDetails
     *
     * @returns Promise<VersionsDict> - Dictionary of runtime strings mapped to their appropriate
     *      VersionDetails object.
     * @error is returned if the call to _getVersionsManifest fails.
     *
     * @note - The intention for this method was to allow for quick lookups dependent upon the
     *      runtime the user wants to download.
     */
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

    /**
     * Retrieves the appropriate VersionDetails object given a runtime
     *
     * @param runtime: string - Runtime the user wants to download. Example: 1.14.4
     * @returns Promise<VersionDetails>.
     * @error is returned if the runtime does not exist.
     *
     * @note - This was built with the intention of using the VersionNDetails object to
     *      retrieve a VersionManifest object.
     */
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

    /**
     * Retrieves the appropriate VersionManifest given a runtime
     *
     * @param runtime: string - Runtime the user wants to download. Example: 1.14.4
     * @returns Promise<VersionManifest>
     * @error is returned if the call to _getVersionDetails or the GET request to the
     *      VersionDetails url fails.
     *
     * @note - This was built with the intention of using the VersionManifest to download
     *      the desired server runtime .jar file.
     */
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
