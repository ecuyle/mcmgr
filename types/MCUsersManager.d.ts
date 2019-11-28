import { MCFMInterface, UserSchemaObject } from "./MCFileManager";

export interface MCUMInterface {
    createUser(username: string, hash: string): UserSchemaObject;
    mcfm: MCFMInterface;
}

export interface CreateUserInterface {
    username: string;
    hash: string;
}
