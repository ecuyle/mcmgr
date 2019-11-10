import { MCFMInterface, UserSchemaObject } from "./MCFileManager";

export interface MCUMInterface {
    createUser(username: string, hash: string): Promise<UserSchemaObject>;
    mcfm: MCFMInterface;
}

export interface CreateUserInterface {
    username: string;
    hash: string;
}
