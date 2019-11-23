import { Request, Response } from 'express';
import { MCServersManager } from './MCServersManager';
import { MCSMInterface, CreateServerInterface, ServerDetails } from '../types/MCServersManager';
import { MCFileManager } from './MCFileManager';
import { MCFMInterface, UserSchemaObject, ServerSchemaObject, EntityFile } from '../types/MCFileManager';
import pino = require('pino');
import { Logger } from 'pino';
import { CreateUserInterface, MCUMInterface } from '../types/MCUsersManager';
import { MCUsersManager } from './MCUsersManager';
import { sendErrorResponse, sendSuccessResponse, copy } from './utils';
import { MCEventBus } from './pubsub/MCEventBus';
import { MCEventBusInterface, MCEvent, Topic } from '../types/MCEventBus';

const logger: Logger = pino();

const dataDirPath = `${__dirname}/../../data`;
const eventBus: MCEventBusInterface = new MCEventBus();
const MCFM: MCFMInterface = new MCFileManager(dataDirPath, eventBus);
const MCSM: MCSMInterface = new MCServersManager(MCFM, eventBus);
const MCUM: MCUMInterface = new MCUsersManager(MCFM);

export function publishEvent(req: Request, res: Response): void {
    const targetTopic: Topic | null = eventBus.getTopic(req.body.topic);

    if (!targetTopic) {
        sendErrorResponse({
            req,
            res,
            methodSrc: 'POST /api/events .publishEvent',
            statusCode: 400,
            e: new Error(`Topic '${targetTopic}' is invalid.`),
            logger,
        });
    }

    const payload = copy(req.body, true);


    const successCallback = msg => {
        sendSuccessResponse({
            req,
            res,
            methodSrc: 'POST /api/events ./publishEvent',
            statusCode: 201,
            msg,
            logger,
        });
    };

    const errorCallback = e => {
        sendErrorResponse({
            req,
            res,
            methodSrc: 'POST /api/events .publishEvent',
            statusCode: 400,
            e,
            logger,
        });
    };

    const event: MCEvent = eventBus.createEvent(targetTopic, payload, successCallback, errorCallback);
    eventBus.publish(event);
}

export function getUserById(req: Request, res: Response): void {
    try {
        const { query: { userId } }: Request = req;

        if (!userId) {
            throw new Error(`Query Param 'userId' is required`);
        }

        const user: UserSchemaObject | void = MCFM.getOneById<UserSchemaObject>('users', Number(userId));

        if (!user) {
            sendErrorResponse({
                req,
                res,
                methodSrc: 'GET /api/mcusr .getUserById',
                statusCode: 400,
                e: new Error(`User with 'userId' ${userId} was not found`),
                logger,
            });

            return;
        }

        sendSuccessResponse({
            req,
            res,
            methodSrc: 'GET /api/mcusr .getUserById',
            statusCode: 200,
            msg: user,
            logger,
        });
    } catch (e) {
        sendErrorResponse({
            req,
            res,
            methodSrc: 'GET /api/mcusr .getUserById',
            statusCode: 400,
            e,
            logger,
        });
    }
};

export async function createUser(req: Request, res: Response): Promise<void> {
    const { username, hash }: CreateUserInterface = req.body;

    try {
        const user: UserSchemaObject = await MCUM.createUser(username, hash);
        sendSuccessResponse({
            req,
            res,
            methodSrc: 'POST /api/mcusr .createUser',
            statusCode: 201,
            msg: user,
            logger,
        });
    } catch (e) {
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

export function getServerDetails(req: Request, res: Response): void {
    try {
        const { query: { serverId } }: Request = req;

        if (typeof parseInt(serverId) !== 'number') {
            throw new Error(`Query Param 'serverId' is required`);
        }

        const serverDetails: ServerDetails = MCSM.getServerDetails(Number(serverId));

        sendSuccessResponse({
            req,
            res,
            methodSrc: 'GET /api/mcsrv/detail .getServerDetails',
            statusCode: 200,
            msg: serverDetails,
            logger,
        });
    } catch(e) {
        sendErrorResponse({
            req,
            res,
            methodSrc: 'GET /api/mcsrv/detail .getServerDetails',
            statusCode: 400,
            e,
            logger,
        });
    }
}

export function getServersByUserId(req: Request, res: Response): void {
    try {
        const { query: { userId } }: Request = req;

        if (!userId) {
            throw new Error(`Query Param "userId" is required`);
        }

        const { dict: servers }: EntityFile<ServerSchemaObject> = MCFM.getAll<ServerSchemaObject>('servers');
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
    } catch (e) {
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

        const serverId: number = await MCSM.createServer(name, runtime, isEulaAccepted, userId, config);
        sendSuccessResponse({
            req,
            res,
            methodSrc: 'POST /api/mcsrv .createServer',
            statusCode: 201,
            msg: serverId,
            logger,
        });
    } catch (e) {
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
