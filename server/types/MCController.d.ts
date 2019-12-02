import { Request, Response } from 'express';
import { MCEventBusInterface } from "./MCEventBus";
import { MCFMInterface } from "./MCFileManager";
import { MCSMInterface } from "./MCServersManager";
import { MCUMInterface } from "./MCUsersManager";
import { Logger } from "pino";

export interface MCControllerInterface {
    dataDirPath: string;
    eventBus: MCEventBusInterface;
    MCFM: MCFMInterface;
    MCSM: MCSMInterface;
    MCUM: MCUMInterface;
    logger: Logger;

    publishEvent(req: Request, res: Response): void;
    getUserById(req: Request, res: Response): void;
    createUser(req: Request, res: Response): Promise<void>;
    getServerDetails(req: Request, res: Response): void;
    getServersByUserId(req: Request, res: Response): void;
    createServer(req: Request, res: Response): Promise<void>;
    updateServerConfig(req: Request, res: Response): Promise<void>;
}
