import { Request, Response, NextFunction } from "express";
import * as LocalStrategy from "passport-local";
import { MCControllerInterface } from "../../types/MCController";
import { UserSchemaObject } from "../../types/MCFileManager";
import bcrypt = require("bcryptjs");

export const setupPassport: Function = function(
  passport: any,
  controller: MCControllerInterface
): void {
  passport.serializeUser(function(user: UserSchemaObject, done: Function) {
    console.log("seralizling");
    done(null, user.id);
  });

  passport.deserializeUser(function(id: number, done: Function) {
    const user: void | UserSchemaObject = controller.MCFM.getOneById<
      UserSchemaObject
    >("users", id);

    if (!user) {
      done(new Error(`User at id ${id} could not be found`));
    } else {
      delete user.hash;
      done(null, user);
    }
  });

  passport.use(
    new LocalStrategy(function(
      username: string,
      password: string,
      done: Function
    ) {
      try {
        const results: Array<UserSchemaObject> = controller.MCFM.query<
          UserSchemaObject
        >("users", `username=${username}`);

        if (results && bcrypt.compareSync(password, results[0].hash)) {
          delete results[0].hash;
          return done(null, results[0]);
        }

        if (!results) {
          return done(null, false, {
            message: `User with username '${username}' could not be found`
          });
        }

        return done(null, false, { message: "Oops, wrong password" });
      } catch (e) {
        return done(e);
      }
    })
  );
};

export const isLoggedIn: (
  req: Request,
  res: Response,
  next: NextFunction
) => any = function(req: Request, res: Response, next: NextFunction): any {
  if (req.isAuthenticated()) {
    return next();
  }

  res.status(401).send();
};
