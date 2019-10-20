import * as sh from 'shelljs';
import { MCServersManager } from './MCServersManager';
import { MCSMInterface } from '../declarations/MCServersManager';

sh.rm('-rf', '/home/ecuyle/Code/mcmgr/mcsrv-test');

const mcsm: MCSMInterface = new MCServersManager();
mcsm.createServer('mcsrv-test', '1.14.4', true);
