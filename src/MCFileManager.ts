import {
    readFileSync,
    writeFileSync,
    readdirSync,
} from 'fs';
import {
    MCFMInterface,
    ServerSchemaObject,
    UserSchemaObject,
    EntitiesDictionary,
    EntityFile,
    BaseSchemaObject,
} from '../types/MCFileManager';

export class MCFileManager implements MCFMInterface {
    public rootDataPath: string;
    public entities: EntitiesDictionary;

    public constructor(rootDataPath: string) {
        this.rootDataPath = rootDataPath;
        this._retrieveAndSetEntities();
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
        const entityFile: EntityFile<T> = this.getAll(target);
        const entity: T | void = entityFile.dict[id];

        return entity;
    }

    public updateOrAdd<T extends BaseSchemaObject>(target: string, newEntity: T): T {
        try {
            const entityFile: EntityFile<T> = this.getAll(target);
            const path: string | void = this._getPathForEntity(target);

            if (!path) {
                throw new Error(`FATAL :: updateOrAdd :: Path for ${target} does not exist`);
            }

            if (!entityFile.dict[newEntity.id]) {
                if (newEntity.id !== undefined) {
                    throw new Error('FATAL :: updateOrAdd :: Server Id provided does not exist');
                }

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

    private _getPathForEntity(entityName: string): string | void {
        return this.entities[entityName];
    }
    
    private _retrieveAndSetEntities(): void {
        const files = readdirSync(this.rootDataPath);
        const entitiesDict: EntitiesDictionary = {};
        
        files.forEach(file => {
            const entity = file.split('.')[0];
            entitiesDict[entity] = `${this.rootDataPath}/${file}`;
        });

        this.entities = entitiesDict;
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
