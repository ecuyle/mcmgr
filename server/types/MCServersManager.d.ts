import { MCFMInterface, ServerSchemaObject } from '../types/MCFileManager';
import { MCEventBusInterface, MCEvent } from './MCEventBus';
import { ChildProcess } from 'child_process';
import {
    ServerConfigKey,
    ServerConfigValue,
    ServerConfigType,
    ServerDetails,
    ServerConfig,
} from '../../types/base';

export interface MCSMInterface {
    mcfm: MCFMInterface;
    activeServers: ServersList;

    getServerDetails(serverId: number): ServerDetails;
    updateServerConfig(serverId: number, newConfig: ServerConfig): Promise<ServerConfig>;
    createServer(name: string, runtime: string, isEulaAccepted: boolean, userId: number, config?: ServerConfig): Promise<ServerSchemaObject>;
    startServer(event: MCEvent): boolean;
    stopServer(event: MCEvent): boolean;
    issueCommand(event: MCEvent): boolean;
}

export interface CreateServerInterface {
    userId: number;
    name: string;
    runtime: string;
    isEulaAccepted: boolean;
    config: ServerConfig;
}

export type ServersList = Record<number, ChildProcess>;

// Pass through from base
export type ServerConfigKey = ServerConfigKey;
export type ServerConfigValue = ServerConfigValue;
export type ServerConfigType = ServerConfigType;
export interface ServerDetails extends ServerDetails {}
export interface ServerConfig extends ServerConfigType {}
