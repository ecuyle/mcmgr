export interface MCFMInterface {
    rootDataPath: string;
    entities: EntitiesDictionary;

    getAll<T>(entity: string): EntityFile<T>;
    getOneById<T>(entity: string, id: number): T | void;
    updateOrAdd<T extends BaseSchemaObject>(target: string, newEntity: T, relationships?: RelationshipsMapping): T;
}

export interface BaseSchemaObject {
    id: number;
}

export interface ServerSchemaObject extends BaseSchemaObject {
    uid: number;
    path: string;
}

export interface UserSchemaObject extends BaseSchemaObject {
    username: string;
    hash: string;
    servers: EntityKVPair<ServerSchemaObject>;
}

export interface EntityFile<T> {
    entity: string;
    latestId: number;
    dict: EntityKVPair<T>;
}

export type EntitiesDictionary = Record<string, string>;
export type RelationshipsMapping = Record<string, number>;
export type EntityKVPair<T> = Record<number, T>;
