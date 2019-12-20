import express = require('express');
import { MCControllerInterface } from '../../types/MCController';

const createMcusrRouter = (mcc: MCControllerInterface): express.Router => {
  const { Router } = express;
  const mcusrRouter: express.Router = Router();

  mcusrRouter.get('/', mcc.getUserById.bind(mcc));
  mcusrRouter.post('/', mcc.createUser.bind(mcc));

  return mcusrRouter;
};

export default createMcusrRouter;
