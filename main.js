const MCServersManager = require('./MCServersManager.js');
const mcsm = new MCServersManager();
// mcsm.createServer('mcsrv-test', '1.14.4');
mcsm._copyTemplatesIntoServerDir('/home/ecuyle/Code/mcmgr/mcsrv-test');
