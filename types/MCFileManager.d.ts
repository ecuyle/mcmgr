export interface MCFMInterface {
    rootDataPath: string;
    entities: EntitiesDictionary;

    getAll<T>(entity: string): EntityFile<T>;
    getOneById<T>(entity: string, id: number): T | void;
}

export interface ServerSchemaObject {
    sid: number;
    uid: number;
    path: string;
}

export interface UserSchemaObject {
    uid: number;
    username: string;
    hash: string;
    servers: Array<ServerSchemaObject>;
}

export interface EntityFile<T> {
    entity: string;
    rows: Array<T>;
    dict: EntityKVPair<T>;
}

export type EntitiesDictionary = Record<string, string>;
export type EntityKVPair<T> = Record<number, T>;
