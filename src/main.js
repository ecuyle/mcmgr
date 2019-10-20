const sh = require('shelljs');
const MCServersManager = require('./MCServersManager.js');

sh.rm('-rf', '/home/ecuyle/Code/mcmgr/mcsrv-test');

const mcsm = new MCServersManager();
mcsm.createServer('mcsrv-test', '1.14.4', true);
