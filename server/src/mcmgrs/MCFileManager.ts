import {
    readFileSync,
    writeFileSync,
    readdirSync,
} from 'fs';
import {
    MCFMInterface,
    EntitiesDictionary,
    EntityFile,
    BaseSchemaObject,
    ParamsDict,
} from '../../types/MCFileManager';
import { MCEventBusInterface } from '../../types/MCEventBus';

export class MCFileManager implements MCFMInterface {
    public rootDataPath: string;
    public entities: EntitiesDictionary = {};

    private _eventBus: MCEventBusInterface;

    public constructor(rootDataPath: string, eventBus: MCEventBusInterface) {
        this.rootDataPath = rootDataPath;
        this._eventBus = eventBus;
        this._retrieveAndSetEntities();
    }

    public getFileContents(path: string): string {
        return readFileSync(path).toString();
    }

    public getAll<T>(entity: string): EntityFile<T> {
        try {
            const entityPath: string | void = this._getPathForEntity(entity);

            if (!entityPath) {
                throw new Error(`FATAL EXTERNAL :: getAll :: entity ${entity} does not exist`);
            }

            const entityFile: EntityFile<T> = JSON.parse(readFileSync(entityPath).toString());

            return entityFile;
        } catch(e) {
            return e;
        }
    }

    public getOneById<T>(target: string, id: number): T | void {
        const entityFile: EntityFile<T> = this.getAll<T>(target);
        const entity: T | void = entityFile.dict[id];

        return entity;
    }

    public updateOrAdd<T extends BaseSchemaObject>(target: string, newEntity: T): T {
        try {
            const entityFile: EntityFile<T> = this.getAll<T>(target);
            const path: string | void = this._getPathForEntity(target);

            if (!path) {
                throw new Error(`FATAL :: updateOrAdd :: Path for ${target} does not exist`);
            }

            if (newEntity.id && !entityFile.dict[newEntity.id]) {
                throw new Error('FATAL :: updateOrAdd :: Server Id provided does not exist');
            } else if (newEntity.id === undefined) {
                entityFile.latestId += 1;
                newEntity.id = entityFile.latestId;
            }

            entityFile.dict[newEntity.id] = newEntity;
            const data: Uint8Array = new Uint8Array(Buffer.from(JSON.stringify(entityFile)));
            writeFileSync(path, data);

            return newEntity;
        } catch(e) {
            return e;
        }
    }

    /**
     * Deletes a single entity within an entity json data file
     *
     * @param target: string - Target entity json data file
     * @param id: number - Uniquely identifies a single entity
     *
     * @returns true if the entity was successfully deleted. false if nothing
     *   was deleted
     */
    public deleteById<T>(target: string, id: number): boolean {
        try {
            const entityFile: EntityFile<T> = this.getAll<T>(target);
            const entityFilePath: string | void = this._getPathForEntity(target);

            if (!entityFilePath) {
                throw new Error(`FATAL :: deleteById :: File path for ${target} was not found`);
            }

            if (entityFile.dict[id] !== undefined) {
                delete entityFile.dict[id];
                const data: Uint8Array = new Uint8Array(Buffer.from(JSON.stringify(entityFile)));
                writeFileSync(entityFilePath, data);

                return true;
            }

            return false;
        } catch(e) {
            return e;
        }
    }

    /**
     * Queries an entity data file given well-formed params and returns
     * desired entities in an EntityKVPair object
     *
     * @param target: string - Target entity data file
     * @param params: string - Well-formed query params
     *
     * @returns an EntityKVPair<T> object if the query params and target
     *   are well formed. An error is thrown if otherwise
     *
     * @note - Well formed query params ought to look something like:
     *   `fk_user_id=4&runtime=1.13` or `?fk_user_id=4&runtime=1.13`
     */
    public query<T>(target: string, params: string): Array<T> {
        try {
            const { dict }: EntityFile<T> = this.getAll<T>(target);
            const paramsDict: ParamsDict = this._createParamsDict(params);
            const results: Array<T> = [];

            Object.keys(dict).forEach((key: string) => {
                const entity: T = dict[Number(key)];

                if (this._matchEntityWithQueryParams<T>(entity, paramsDict)) {
                    results.push(entity);
                }
            });

            return results;
        } catch(e) {
            return e;
        }
    }

    /**
     * Compares a dict of query param key-value pairs against the key-value
     * pairs in a given entity
     *
     * @param entity: T - Entity to match params against
     * @param paramsDict: ParamsDict - Dict of query param key-value pairs
     *
     * @returns true if all provided query params exist and match within the entity.
     *   Returns false otherwise.
     */
    private _matchEntityWithQueryParams<T extends BaseSchemaObject>(entity: T, paramsDict: ParamsDict): boolean {
        const keys: Array<string> = Object.keys(paramsDict);

        for (let i: number = 0; i < keys.length; i++) {
            const key: string = keys[i];
            const value: string = paramsDict[key];

            if (String(entity[key]) !== String(value)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Creates a dict from a query params string
     *
     * @param params: string - Query params string
     *
     * @returns a ParamsDict
     */
    private _createParamsDict(params: string): ParamsDict {
        const paramsDict: ParamsDict = {};
        const paramsRegex: RegExp = /([^?=&]+)(=[^&]*)/gm;
        const paramsList: Array<string> | null = params.match(paramsRegex)

        if (paramsList) {
            paramsList.forEach(param => {
                const [k, v]: Array<string> = param.split('=');
                paramsDict[k] = v;
            });
        }

        return paramsDict;
    }

    private _getPathForEntity(entityName: string): string | void {
        return this.entities[entityName];
    }

    private _retrieveAndSetEntities(): void {
        const files = readdirSync(this.rootDataPath);

        files.forEach(file => {
            const entity = file.split('.')[0];
            this.entities[entity] = `${this.rootDataPath}/${file}`;
        });
    }

    public resetEntityFile<T>(target: string, targetPath: string): string {
        const entityTemplateFile: EntityFile<T> = {
            entity: target,
            latestId: -1,
            dict: {},
        };

        const data: Uint8Array = new Uint8Array(Buffer.from(JSON.stringify(entityTemplateFile)));
        writeFileSync(targetPath, data);

        return targetPath;
    }
}
