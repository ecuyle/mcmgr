'use strict';

const { MCEventBus } = require('./dist/src/pubsub/MCEventBus.js');
const { MCUsersManager } = require('./dist/src/mcmgrs/MCUsersManager.js');
const { MCFileManager } = require('./dist/src/mcmgrs/MCFileManager.js');
const eventBus = new MCEventBus();
const DATA_DIR = '../data/';
const mcFileMgr = new MCFileManager(DATA_DIR, eventBus);
const mcUsersMgr = new MCUsersManager(mcFileMgr);

const createAdmin = () => {
    const [username, hash] = process.argv[2].split(':');
    mcUsersMgr.createUser(username, hash, true);
};

createAdmin();
