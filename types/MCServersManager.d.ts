import { MCFMInterface } from '../types/MCFileManager';
import { MCEventBusInterface, MCEvent } from './MCEventBus';
import { ChildProcess } from 'child_process';

export interface MCSMInterface {
    mcfm: MCFMInterface;
    activeServers: ServersList;

    getServerDetails(serverId: number): ServerDetails;
    createServer(name: string, runtime: string, isEulaAccepted: boolean, userId: number, config?: ServerConfig): Promise<number>;
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
export type ServerConfigKey = string;
export type ServerConfigValue = string | number | boolean | undefined;
export type ServerConfigType = Record<ServerConfigKey, ServerConfigValue>;

export interface ServerDetails {
    config: ServerConfig;
    path: string;
    isEulaAccepted: boolean;
    id: number;
    runtime: string;
    name: string;
}

export interface ServerConfig extends ServerConfigType {
    "spawn-protection"?: number;
    "max-tick-time"?: number;
    "query.port"?: number;
    "generator-settings"?: string;
    "force-gamemode"?: boolean;
    "allow-nether"?: boolean;
    "enforce-whitelist"?: boolean;
    "gamemode"?: string;
    "broadcast-console-to-ops"?: boolean;
    "enable-query"?: boolean;
    "player-idle-timeout"?: number;
    "difficulty"?: string;
    "spawn-monsters"?: boolean;
    "broadcast-rcon-to-ops"?: boolean;
    "op-permission-level"?: number;
    "pvp"?: boolean;
    "snooper-enabled"?: boolean;
    "level-type"?: string;
    "hardcore"?: boolean;
    "enable-command-block"?: boolean;
    "max-players"?: number;
    "network-compression-threshold"?: number;
    "resource-pack-sha1"?: string;
    "max-world-size"?: number;
    "function-permission-level"?: number;
    "rcon.port"?: number;
    "server-port"?: number;
    "server-ip"?: string;
    "spawn-npcs"?: boolean;
    "allow-flight"?: boolean;
    "level-name"?: string;
    "view-distance"?: number;
    "resource-pack"?: string;
    "spawn-animals"?: boolean;
    "white-list"?: boolean;
    "rcon.password"?: string;
    "generate-structures"?: boolean;
    "max-build-height"?: number;
    "online-mode"?: boolean;
    "level-seed"?: string;
    "use-native-transport"?: boolean;
    "prevent-proxy-connections"?: boolean;
    "enable-rcon"?: boolean;
    "motd"?: string;
}
