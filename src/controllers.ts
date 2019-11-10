import { Request, Response } from 'express';
import { MCServersManager } from './MCServersManager';
import { MCSMInterface, CreateServerInterface } from '../types/MCServersManager';
import { MCFileManager } from './MCFileManager';
import { MCFMInterface, UserSchemaObject } from '../types/MCFileManager';
import pino = require('pino');
import { Logger } from 'pino';
import { CreateUserInterface, MCUMInterface } from '../types/MCUsersManager';
import { MCUsersManager } from './MCUsersManager';

const logger: Logger = pino();

const dataDirPath = `${__dirname}/../../data`;
const MCFM: MCFMInterface = new MCFileManager(dataDirPath);

export async function createUser(req: Request, res: Response): Promise<void> {
    const mcum: MCUMInterface = new MCUsersManager(MCFM);
    const { username, hash }: CreateUserInterface = req.body;

    try {
        const user: UserSchemaObject = await mcum.createUser(username, hash);
        logger.info(`POST /createUser :: 201 :: ${req}`);
        res.status(201).send(JSON.stringify(user));
    } catch(e) {
        logger.error(e);
        logger.error(`POST /createUser :: 400 :: ${req} :: ${e}`);
        res.status(400).send(JSON.stringify(e));
    }
}

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
