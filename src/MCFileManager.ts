import {
    readFileSync,
    writeFile,
    readdirSync,
} from 'fs';
import {
    MCFMInterface,
    ServerSchemaObject,
    UserSchemaObject,
    EntitiesDictionary,
    EntityFile,
    BaseSchemaObject,
    RelationshipsMapping,
    EntityKVPair,
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
            const entityPath: string = this.entities[entity];

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

    public updateOrAdd<T extends BaseSchemaObject>(target: string, newEntity: T, relationships?: RelationshipsMapping): T {
        const entityFile: EntityFile<T> = this.getAll(target);
        const existingId: number = newEntity.id;
        
        if (!entityFile.dict[existingId]) {
            entityFile.latestId += 1;
            newEntity.id = existingId === undefined
            ? entityFile.latestId
            : existingId;
        }
        
        entityFile.dict[existingId] = newEntity;

        Object.keys(relationships).forEach(entity => {
            const relationshipFile:
        });

        return newEntity;
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
}

const mcfm: MCFMInterface = new MCFileManager(`${__dirname}/../../data`);
console.log(mcfm.getAll<ServerSchemaObject>('servers'));
console.log(mcfm.getOneById<ServerSchemaObject>('servers', 0));
