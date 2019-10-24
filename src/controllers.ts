import { Request, Response } from 'express';
import { MCServersManager } from './MCServersManager';
import { MCSMInterface, CreateServerInterface } from '../types/MCServersManager';
import pino = require('pino');
import { Logger } from 'pino';

const logger: Logger = pino();

export async function createServer(req: Request, res: Response): Promise<void> {
    logger.info('POST /createServer');
    const mcsm: MCSMInterface = new MCServersManager();
    const {
        name,
        runtime,
        isEulaAccepted,
        config,
    }: CreateServerInterface = req.body;

    try {
        const serverId: number = await mcsm.createServer(name, runtime, isEulaAccepted, config);
        logger.info('POST SUCCESS');
        res.status(201).send(serverId);
    } catch(e) {
        logger.error(e);
        res.status(400).send(e)
    }
}
