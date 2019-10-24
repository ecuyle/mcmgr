import { Request, Response } from 'express';
import { MCServersManager } from './MCServersManager';
import { MCSMInterface, CreateServerInterface } from '../types/MCServersManager';
import pino = require('pino');
import { Logger } from 'pino';

const logger: Logger = pino();

export async function createServer(req: Request, res: Response): Promise<void> {
    const mcsm: MCSMInterface = new MCServersManager();
    const {
        name,
        runtime,
        isEulaAccepted,
        config,
    }: CreateServerInterface = req.body;

    try {
        const serverId: number = await mcsm.createServer(name, runtime, isEulaAccepted, config);
        logger.info(`POST /createServer :: 201 :: ${req}`);
        res.status(201).send(JSON.stringify(serverId));
    } catch(e) {
        logger.error(e);
        logger.error(`POST /createServer :: 400 :: ${req} :: ${e}`);
        res.status(400).send(JSON.stringify(e));
    }
}
