import express = require('express');
import { MCControllerInterface } from '../../types/MCController';
import { isLoggedIn } from '../config/passport';

const createMcsrvRouter = (mcc: MCControllerInterface): express.Router => {
  const { Router } = express;
  const mcsrvRouter: express.Router = Router();

  mcsrvRouter.get('/', isLoggedIn, mcc.getServersByUserId.bind(mcc));
  mcsrvRouter.post('/', mcc.createServer.bind(mcc));
  mcsrvRouter.put('/', mcc.updateServerConfig.bind(mcc));

  mcsrvRouter.get('/detail', mcc.getServerDetails.bind(mcc));

  return mcsrvRouter;
};

export default createMcsrvRouter;
