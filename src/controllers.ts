import { Request, Response } from 'express';
import { MCServersManager } from './MCServersManager';
import { MCSMInterface, CreateServerInterface } from '../types/MCServersManager';
import { MCFileManager } from './MCFileManager';
import { MCFMInterface } from '../types/MCFileManager';
import pino = require('pino');
import { Logger } from 'pino';

const logger: Logger = pino();

const dataDirPath = `${__dirname}/../../data`;
const MCFM: MCFMInterface = new MCFileManager(dataDirPath);

export async function createServer(req: Request, res: Response): Promise<void> {
    const mcsm: MCSMInterface = new MCServersManager(MCFM);
    const {
        userId,
        name,
        runtime,
        isEulaAccepted,
        config,
    }: CreateServerInterface = req.body;

    try {
        const serverId: number = await mcsm.createServer(name, runtime, isEulaAccepted, userId, config);
        logger.info(`POST /createServer :: 201 :: ${req}`);
        res.status(201).send(JSON.stringify(serverId));
    } catch(e) {
        logger.error(e);
        logger.error(`POST /createServer :: 400 :: ${req} :: ${e}`);
        res.status(400).send(JSON.stringify(e));
    }
}
