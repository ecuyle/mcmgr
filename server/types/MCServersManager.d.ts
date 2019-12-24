import { MCFMInterface, ServerSchemaObject } from '../types/MCFileManager';
import { MCEventBusInterface, MCEvent } from './MCEventBus';
import { ChildProcess } from 'child_process';
import * as baseTypes from '../../types/base';

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
export type ServerConfigKey = baseTypes.ServerConfigKey;
export type ServerConfigValue = baseTypes.ServerConfigValue;
export type ServerConfigType = baseTypes.ServerConfigType;
export interface ServerDetails extends baseTypes.ServerDetails {}
export interface ServerConfig extends baseTypes.ServerConfigType {}
