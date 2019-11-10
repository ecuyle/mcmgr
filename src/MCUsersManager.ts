import { MCFMInterface, UserSchemaObject } from "../types/MCFileManager";
import { MCUMInterface } from "../types/MCUsersManager";

export class MCUsersManager implements MCUMInterface {
    public mcfm: MCFMInterface;

    public constructor(mcfm: MCFMInterface) {
        this.mcfm = mcfm;
    }

    public async createUser(username: string, hash: string): Promise<UserSchemaObject> {
        try {
            const user: UserSchemaObject = this.mcfm.updateOrAdd<UserSchemaObject>('users', {
                username,
                hash,
            });

            return user;
        } catch(e) {

        }
    }
}
