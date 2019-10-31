import * as sh from 'shelljs';
import { MCServersManager } from './MCServersManager';
import { MCSMInterface } from '../types/MCServersManager';

sh.rm('-rf', `${__dirname}/mcsrv-test`);

// const mcsm: MCSMInterface = new MCServersManager();
// mcsm.createServer('mcsrv-test', '1.14.4', true);
