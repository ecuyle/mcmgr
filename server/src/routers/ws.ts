import express = require('express');
import { RouterWs } from '../../types/Common';
import { MCControllerInterface } from '../../types/MCController';

const createWsRouter = (mcc: MCControllerInterface): RouterWs => {
  const wsRouter: RouterWs = express.Router() as RouterWs;
  wsRouter.ws('/connect', mcc.connect.bind(mcc));

  return wsRouter;
};

export default createWsRouter;
