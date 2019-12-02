import { Request, Response } from 'express';
import { MCServersManager } from './mcmgrs/MCServersManager';
import { MCSMInterface, CreateServerInterface, ServerDetails, ServerConfig } from '../types/MCServersManager';
import { MCFileManager } from './mcmgrs/MCFileManager';
import { MCFMInterface, UserSchemaObject, ServerSchemaObject, EntityFile } from '../types/MCFileManager';
import { Logger } from 'pino';
import { CreateUserInterface, MCUMInterface } from '../types/MCUsersManager';
import { MCUsersManager } from './mcmgrs/MCUsersManager';
import { sendErrorResponse, sendSuccessResponse, copy } from './utils';
import { MCEventBusInterface, MCEvent, Topic } from '../types/MCEventBus';
import { MCControllerInterface } from '../types/MCController';

export class MCController implements MCControllerInterface {
    public dataDirPath: string;
    public eventBus: MCEventBusInterface;
    public MCFM: MCFMInterface;
    public MCSM: MCSMInterface;
    public MCUM: MCUMInterface;
    public logger: Logger;

    constructor(logger: Logger, dataDirPath: string, eventBus: MCEventBusInterface) {
        this.logger = logger;
        this.dataDirPath = dataDirPath;
        this.eventBus = eventBus;
        this.MCFM = new MCFileManager(dataDirPath, eventBus);
        this.MCSM = new MCServersManager(this.MCFM, eventBus);
        this.MCUM = new MCUsersManager(this.MCFM);
    }

    public publishEvent(req: Request, res: Response): void {
        const targetTopic: Topic | null = this.eventBus.getTopic(req.body.topic);

        if (!targetTopic) {
            sendErrorResponse({
                req,
                res,
                methodSrc: 'POST /api/events .publishEvent',
                statusCode: 400,
                e: new Error(`Topic '${targetTopic}' is invalid.`),
                logger: this.logger,
            });

            return;
        }

        const payload = copy(req.body, true);

        const successCallback = (msg: any) => {
            sendSuccessResponse({
                req,
                res,
                methodSrc: 'POST /api/events ./publishEvent',
                statusCode: 201,
                msg,
                logger: this.logger,
            });
        };

        const errorCallback = (e: any) => {
            sendErrorResponse({
                req,
                res,
                methodSrc: 'POST /api/events .publishEvent',
                statusCode: 400,
                e,
                logger: this.logger,
            });
        };

        const event: MCEvent = this.eventBus.createEvent(targetTopic, payload, successCallback, errorCallback);
        this.eventBus.publish(event);
    }

    public getUserById(req: Request, res: Response): void {
        try {
            const { query: { userId } }: Request = req;

            if (!userId) {
                throw new Error(`Query Param 'userId' is required`);
            }

            const user: UserSchemaObject | void = this.MCFM.getOneById<UserSchemaObject>('users', Number(userId));

            if (!user) {
                sendErrorResponse({
                    req,
                    res,
                    methodSrc: 'GET /api/mcusr .getUserById',
                    statusCode: 400,
                    e: new Error(`User with 'userId' ${userId} was not found`),
                    logger: this.logger,
                });

                return;
            }

            sendSuccessResponse({
                req,
                res,
                methodSrc: 'GET /api/mcusr .getUserById',
                statusCode: 200,
                msg: user,
                logger: this.logger,
            });
        } catch (e) {
            sendErrorResponse({
                req,
                res,
                methodSrc: 'GET /api/mcusr .getUserById',
                statusCode: 400,
                e,
                logger: this.logger,
            });
        }
    };

    public async createUser(req: Request, res: Response): Promise<void> {
        const { username, hash }: CreateUserInterface = req.body;

        try {
            const user: UserSchemaObject = await this.MCUM.createUser(username, hash);
            sendSuccessResponse({
                req,
                res,
                methodSrc: 'POST /api/mcusr .createUser',
                statusCode: 201,
                msg: user,
                logger: this.logger,
            });
        } catch (e) {
            sendErrorResponse({
                req,
                res,
                methodSrc: 'POST /api/mcusr .createUser',
                statusCode: 400,
                e,
                logger: this.logger,
            });
        }
    }

    public getServerDetails(req: Request, res: Response): void {
        try {
            const { query: { serverId } }: Request = req;

            if (typeof parseInt(serverId) !== 'number') {
                throw new Error(`Query Param 'serverId' is required`);
            }

            const serverDetails: ServerDetails = this.MCSM.getServerDetails(Number(serverId));

            sendSuccessResponse({
                req,
                res,
                methodSrc: 'GET /api/mcsrv/detail .getServerDetails',
                statusCode: 200,
                msg: serverDetails,
                logger: this.logger,
            });
        } catch(e) {
            sendErrorResponse({
                req,
                res,
                methodSrc: 'GET /api/mcsrv/detail .getServerDetails',
                statusCode: 400,
                e,
                logger: this.logger,
            });
        }
    }

    public getServersByUserId(req: Request, res: Response): void {
        try {
            const { query: { userId } }: Request = req;

            if (!userId) {
                throw new Error(`Query Param "userId" is required`);
            }

            const { dict: servers }: EntityFile<ServerSchemaObject> = this.MCFM.getAll<ServerSchemaObject>('servers');
            const filteredServers: Array<ServerSchemaObject> = [];
            Object.keys(servers).forEach((serverId: string) => {
                const server = servers[Number(serverId)];
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
                logger: this.logger,
            });
        } catch (e) {
            sendErrorResponse({
                req,
                res,
                methodSrc: 'GET /api/mcsrv .getServers',
                statusCode: 400,
                e,
                logger: this.logger,
            });
        }
    }

    public async createServer(req: Request, res: Response): Promise<void> {
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

            const server: ServerSchemaObject = await this.MCSM.createServer(name, runtime, isEulaAccepted, userId, config);
            sendSuccessResponse({
                req,
                res,
                methodSrc: 'POST /api/mcsrv .createServer',
                statusCode: 201,
                msg: server,
                logger: this.logger,
            });
        } catch (e) {
            sendErrorResponse({
                req,
                res,
                methodSrc: 'POST /api/mcsrv .createServer',
                statusCode: 400,
                e,
                logger: this.logger,
            });
        }
    }

    public async updateServerConfig(req: Request, res: Response): Promise<void> {
        const {
            body: {
                serverId,
                config,
            }
        }: Request = req;

        try {
            if (typeof parseInt(serverId) !== 'number' || !config) {
                throw new Error(`The following query params are required: 'serverId', 'config'`);
            }

            const result: ServerConfig = await this.MCSM.updateServerConfig(serverId, config);

            sendSuccessResponse({
                req,
                res,
                methodSrc: 'PUT /api/mcsrv .updateServerConfig',
                statusCode: 201,
                msg: result,
                logger: this.logger,
            });
        } catch(e) {
            sendErrorResponse({
                req,
                res,
                methodSrc: 'PUT /api/mcsrv .updateServerConfig',
                statusCode: 400,
                e,
                logger: this.logger,
            });
        }
    }
}
