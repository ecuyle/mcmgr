export interface MCFMInterface {
    rootDataPath: string;
    entities: EntitiesDictionary;

    getFileContents(path: string): string;
    getAll<T>(entity: string): EntityFile<T>;
    getOneById<T>(entity: string, id: number): T | void;
    updateOrAdd<T extends BaseSchemaObject>(target: string, newEntity: T): T;
    deleteById<T>(target: string, id: number): boolean;
    query<T>(target: string, params: string): Array<T>;
    resetEntityFile<T>(target: string, targetPath: string): string;
}

export interface BaseSchemaObject {
    id?: number;
}

export interface ServerSchemaObject extends BaseSchemaObject {
    fk_users_id: number;
    name: string;
    runtime: string;
    path: string;
}

export interface UserSchemaObject extends BaseSchemaObject {
    username: string;
    hash: string;
}

export interface EntityFile<T> {
    entity: string;
    latestId: number;
    dict: EntityKVPair<T>;
}

export type EntitiesDictionary = Record<string, string>;
export type EntityKVPair<T> = Record<number, T>;
export type ParamsDict = Record<string, string>;
