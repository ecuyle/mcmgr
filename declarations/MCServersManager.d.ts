export interface MCSMInterface {
    createServer(name: string, runtime: string, isEulaAccepted: boolean, config?: UserServerConfig): Promise<boolean>;
}

export interface UserServerConfig {
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
