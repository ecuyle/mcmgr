import * as LocalStrategy from 'passport-local';
import { MCControllerInterface } from '../../types/MCController';
import { UserSchemaObject } from '../../types/MCFileManager';
import bcrypt = require('bcryptjs');

export const setupPassport: Function = function(passport: any, controller: MCControllerInterface) {
    passport.serializeUser(function(user: UserSchemaObject, done: Function) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id: number, done: Function) {
        const user: void | UserSchemaObject = controller.MCFM.getOneById<UserSchemaObject>('users', id);

        if (!user) {
            done(new Error(`User at id ${id} could not be found`));
        } else {
            delete user.hash;
            done(null, user);
        }
    });

    passport.use(
        new LocalStrategy(function(username: string, password: string, done: Function) {
            const results: Array<UserSchemaObject> = controller.MCFM.query<UserSchemaObject>('users', `username=${username}`);

            if (results && bcrypt.compareSync(password, results[0].hash)) {
                delete results[0].hash;
                return done(null, results[0]);
            }

            if (!results) {
                return done(new Error(`User with username '${username}' could not be found`));
            }

            return done(new Error('Oops, wrong password'));
        })
    );
};