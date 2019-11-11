import { Request, Response } from 'express';
import { MCServersManager } from './MCServersManager';
import { MCSMInterface, CreateServerInterface } from '../types/MCServersManager';
import { MCFileManager } from './MCFileManager';
import { MCFMInterface, UserSchemaObject, ServerSchemaObject, EntityFile } from '../types/MCFileManager';
import pino = require('pino');
import { Logger } from 'pino';
import { CreateUserInterface, MCUMInterface } from '../types/MCUsersManager';
import { MCUsersManager } from './MCUsersManager';
import { sendErrorResponse, sendSuccessResponse } from './utils';

const logger: Logger = pino();

const dataDirPath = `${__dirname}/../../data`;
const MCFM: MCFMInterface = new MCFileManager(dataDirPath);

export async function createUser(req: Request, res: Response): Promise<void> {
    const mcum: MCUMInterface = new MCUsersManager(MCFM);
    const { username, hash }: CreateUserInterface = req.body;

    try {
        const user: UserSchemaObject = await mcum.createUser(username, hash);
        sendSuccessResponse({
            req,
            res,
            methodSrc: 'POST /api/mcusr .createUser',
            statusCode: 201,
            msg: user,
            logger,
        });
    } catch(e) {
        sendErrorResponse({
            req,
            res,
            methodSrc: 'POST /api/mcusr .createUser',
            statusCode: 400,
            e,
            logger,
        });
    }
}

export async function getServersByUserId(req: Request, res: Response): Promise<void> {
    try {
        const { userId } = req.query;

        if (userId === undefined) {
            throw new Error(`Query Param "userId" is required`);
        }

        const { dict: servers }: EntityFile<ServerSchemaObject> = MCFM.getAll<ServerSchemaObject>('servers');
        console.log(servers);
        const filteredServers: Array<ServerSchemaObject> = [];
        Object.keys(servers).forEach(serverId => {
            const server = servers[serverId];
            if (server.fk_users_id === Number(userId)) {
                filteredServers.push(server);
            }
        });

        sendSuccessResponse({
            req,
            res,
            methodSrc: 'GET /api/mcsrv .getServers',
            statusCode: 200,
            msg: filteredServers,
            logger,
        });
    } catch(e) {
        sendErrorResponse({
            req,
            res,
            methodSrc: 'GET /api/mcsrv .getServers',
            statusCode: 400,
            e,
            logger,
        });
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
        if (userId === undefined
            || !name
            || !runtime
            || !isEulaAccepted) {
            throw new Error(`The following query params are required: 'userId', 'name', 'runtime', 'isEulaAccepted'`);
        }

        const serverId: number = await mcsm.createServer(name, runtime, isEulaAccepted, userId, config);
        sendSuccessResponse({
            req,
            res,
            methodSrc: 'POST /api/mcsrv .createServer',
            statusCode: 201,
            msg: serverId,
            logger,
        });
    } catch(e) {
         sendErrorResponse({
            req,
            res,
            methodSrc: 'POST /api/mcsrv .createServer',
            statusCode: 400,
            e,
            logger,
        });
   }
}
