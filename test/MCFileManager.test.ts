import assert = require('assert');
import { MCFileManager } from '../src/MCFileManager';
import {
    MCFMInterface,
    ServerSchemaObject,
    UserSchemaObject,
    EntityFile,
} from '../types/MCFileManager';
import { MCEventBusInterface } from '../types/MCEventBus';
import { MCEventBus } from '../src/pubsub/MCEventBus';

const dataPath: string = `${__dirname}/../../data-test`;
const eventBus: MCEventBusInterface = new MCEventBus();

export function runMCFileManagerTests() {
    describe('MCFileManager', function () {
        const mcfm: MCFMInterface = new MCFileManager(dataPath, eventBus);
        mcfm.resetEntityFile<UserSchemaObject>('users', `${dataPath}/users.json`);
        mcfm.resetEntityFile<ServerSchemaObject>('servers', `${dataPath}/servers.json`);

        const expectedServerEntityFile: EntityFile<ServerSchemaObject> = {
            entity: 'servers',
            latestId: -1,
            dict: {}
        }

        const expectedUserEntityFile: EntityFile<UserSchemaObject> = {
            entity: 'users',
            latestId: -1,
            dict: {}
        }

        describe('updateOrAdd', function () {
            describe('servers', function () {
                it('should add a new server when no id is provided', function () {
                    expectedServerEntityFile.dict[0] = {
                        id: 0,
                        fk_users_id: 0,
                        name: 'mcsrv1',
                        runtime: '1.14.1',
                        path: '/home/ecuyle/mcsrv1',
                    };

                    expectedServerEntityFile.latestId = 0;

                    mcfm.updateOrAdd<ServerSchemaObject>('servers', {
                        fk_users_id: 0,
                        name: 'mcsrv1',
                        runtime: '1.14.1',
                        path: '/home/ecuyle/mcsrv1',
                    });

                    assert.deepEqual(expectedServerEntityFile, mcfm.getAll<ServerSchemaObject>('servers'));
                });

                it('should update an existing server given an existing id', function () {
                    const server: ServerSchemaObject | void = mcfm.getOneById<ServerSchemaObject>('servers', 0);

                    if (!server) {
                        throw new Error('FATAL TEST :: server does not exist');
                    }

                    const newRuntime: string = '1.13';
                    server.runtime = newRuntime;
                    mcfm.updateOrAdd<ServerSchemaObject>('servers', server);
                    expectedServerEntityFile.dict[0].runtime = newRuntime;

                    assert.deepEqual(expectedServerEntityFile, mcfm.getAll<ServerSchemaObject>('servers'));
                });
            });

            describe('users', function () {
                it('should add a new user when no id is provided', function () {
                    expectedUserEntityFile.dict[0] = {
                        id: 0,
                        username: 'johndoe',
                        hash: '1234987a',
                    };

                    expectedUserEntityFile.latestId = 0;

                    mcfm.updateOrAdd<UserSchemaObject>('users', {
                        username: 'johndoe',
                        hash: '1234987a',
                    });

                    assert.deepEqual(expectedUserEntityFile, mcfm.getAll<UserSchemaObject>('users'));
                });

                it('should update an existing user given an existing id', function () {
                    const user: UserSchemaObject | void = mcfm.getOneById<UserSchemaObject>('users', 0);

                    if (!user) {
                        throw new Error('FATAL TEST :: user does not exist');
                    }

                    const newUsername: string = 'daffyduck';
                    user.username = newUsername;
                    mcfm.updateOrAdd<UserSchemaObject>('users', user);
                    expectedUserEntityFile.dict[0].username = newUsername;

                    assert.deepEqual(expectedUserEntityFile, mcfm.getAll<UserSchemaObject>('users'));
                });
            });
        });

        describe('getAll', function () {
            describe('servers', function () {
                it('should get all servers in the server entity json file', function () {
                    assert.deepEqual(expectedServerEntityFile, mcfm.getAll<ServerSchemaObject>('servers'));
                });
            });

            describe('users', function () {
                it('should get all users in the user entity json file', function () {
                    assert.deepEqual(expectedUserEntityFile, mcfm.getAll<UserSchemaObject>('users'));
                });
            });
        });

        describe('getOneById', function () {
            describe('servers', function () {
                it('should retrieve a server by its id', function() {
                    assert.deepEqual(expectedServerEntityFile.dict[0], mcfm.getOneById<ServerSchemaObject>('servers', 0));
                });

                it('should return undefined if a server does not exist', function() {
                    assert.equal(undefined, mcfm.getOneById<ServerSchemaObject>('servers', 100));
                });
            });

            describe('users', function () {
                it('should retrieve a user by its id', function() {
                    assert.deepEqual(expectedUserEntityFile.dict[0], mcfm.getOneById<UserSchemaObject>('users', 0));
                });

                it('should return undefined if a user does not exist', function() {
                    assert.equal(undefined, mcfm.getOneById<UserSchemaObject>('users', 100));
                });
            });
        });

        describe('deleteById', function() {
            describe('server', function() {
                it('should return true if server is successfully deleted with the provided id', function() {
                    const result: boolean = mcfm.deleteById<ServerSchemaObject>('servers', 0);
                    delete expectedServerEntityFile.dict[0];
                    assert.deepEqual(expectedServerEntityFile, mcfm.getAll<ServerSchemaObject>('servers'));
                    assert.ok(result);
                });

                it('should return false if no server exists at the provided id', function() {
                    const result: boolean = mcfm.deleteById<ServerSchemaObject>('servers', 0);
                    delete expectedServerEntityFile.dict[0];
                    assert.deepEqual(expectedServerEntityFile, mcfm.getAll<ServerSchemaObject>('servers'));
                    assert.ok(!result)
                });
            });

            describe('users', function() {
                it('should return true if user is successfully deleted with the provided id', function() {
                    const result: boolean = mcfm.deleteById<UserSchemaObject>('users', 0);
                    delete expectedUserEntityFile.dict[0];
                    assert.deepEqual(expectedUserEntityFile, mcfm.getAll<UserSchemaObject>('users'));
                    assert.ok(result)
                });

                it('should return false if no user exists at the provided id', function() {
                    const result: boolean = mcfm.deleteById<UserSchemaObject>('users', 0);
                    delete expectedUserEntityFile.dict[0];
                    assert.deepEqual(expectedUserEntityFile, mcfm.getAll<UserSchemaObject>('users'));
                    assert.ok(!result)
                });
            });
        });

        describe('query', function() {
            describe('server', function() {
                it('should return an empty array if there are no results for the provided query params', function() {
                    const expected: Array<ServerSchemaObject> = [];
                    const actual: Array<ServerSchemaObject> = mcfm.query<ServerSchemaObject>('servers', '?fk_users_id=0');

                    assert.deepEqual(expected, actual);
                });

                it('should return an array of servers appropriate to the query params provided', function() {
                    const data: Array<ServerSchemaObject> = [
                        {
                            id: 1,
                            fk_users_id: 1,
                            name: 'srv1',
                            runtime: '1.13',
                            path: '/home/ecuyle/srv1',
                        },
                        {
                            id: 2,
                            fk_users_id: 1,
                            name: 'srv2',
                            runtime: '1.14.1',
                            path: '/home/ecuyle/srv2',
                        },
                        {
                            id: 3,
                            fk_users_id: 2,
                            name: 'srv2',
                            runtime: '1.14',
                            path: '/home/ecuyle/srv3',
                        },
                    ];

                    const expectedSingleParam = data.slice(0, 2);
                    const expectedMultiParam = data.slice(1, 2);

                    data.forEach(server => {
                        delete server.id;
                        mcfm.updateOrAdd<ServerSchemaObject>('servers', server);
                    });

                    const actualSingleParam: Array<ServerSchemaObject> = mcfm.query<ServerSchemaObject>('servers', '?fk_users_id=1');
                    const actualMultiParam: Array<ServerSchemaObject> = mcfm.query<ServerSchemaObject>('servers', '?fk_users_id=1&runtime=1.14.1');

                    assert.deepEqual(expectedSingleParam, actualSingleParam);
                    assert.deepEqual(expectedMultiParam, actualMultiParam);
                });
            });

            describe('user', function() {
                it('should return an empty array if there are no results for the provided query params', function() {
                    const expected: Array<UserSchemaObject> = [];
                    const actual: Array<UserSchemaObject> = mcfm.query<UserSchemaObject>('users', '?hash=asdf34');

                    assert.deepEqual(expected, actual);
                });

                it('should return an array of users appropriate to the query params provided', function() {
                    const data: Array<UserSchemaObject> = [
                        {
                            id: 1,
                            username: 'johnnycash',
                            hash: '12345',
                        },
                        {
                            id: 2,
                            username: 'johnnydepp',
                            hash: '12345',
                        },
                        {
                            id: 3,
                            username: 'janicekepp',
                            hash: 'asdf',
                        },
                    ];

                    const expectedSingleParam = data.slice(0, 2);
                    const expectedMultiParam = data.slice(1, 2);

                    data.forEach(user => {
                        delete user.id;
                        mcfm.updateOrAdd<UserSchemaObject>('users', user);
                    });

                    const actualSingleParam: Array<UserSchemaObject> = mcfm.query<UserSchemaObject>('users', '?hash=12345');
                    const actualMultiParam: Array<UserSchemaObject> = mcfm.query<UserSchemaObject>('users', '?hash=12345&username=johnnydepp');

                    assert.deepEqual(expectedSingleParam, actualSingleParam);
                    assert.deepEqual(expectedMultiParam, actualMultiParam);
                });
            });
        });
    });
}