import { MCFMInterface, UserSchemaObject } from "../../types/MCFileManager";
import { MCUMInterface } from "../../types/MCUsersManager";
import bcrypt = require('bcryptjs');

export class MCUsersManager implements MCUMInterface {
    public mcfm: MCFMInterface;

    public constructor(mcfm: MCFMInterface) {
        this.mcfm = mcfm;
    }

    public createUser(username: string, password: string, isPasswordHashed = false): UserSchemaObject {
        try {
            const salt = bcrypt.genSaltSync(10);

            const hash = isPasswordHashed
                ? bcrypt.hashSync(password, salt)
                : password;
            const user: UserSchemaObject = this.mcfm.updateOrAdd<UserSchemaObject>('users', {
                username,
                hash,
            });

            return user;
        } catch(e) {
            return e;
        }
    }
}
