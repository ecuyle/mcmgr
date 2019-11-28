import { VersionDownloadDetails } from './Common';

export interface MCVMInterface {
    getVersionManifest(runtime: string): Promise<VersionManifest>;
}

export interface VersionsManifest {
    versions: Array<VersionDetails>;
}

export interface VersionDetails {
    id: string;
    type: string;
    url: string;
    time: string;
    releaseTime: string;
}

export type VersionsDict = Record<string, VersionDetails>;

export interface VersionManifest {
    downloads: {
        client: VersionDownloadDetails;
        server: VersionDownloadDetails;
    }
}
