import express = require('express');
import { MCControllerInterface } from '../../types/MCController';

const createEventsRouter = (mcc: MCControllerInterface): express.Router => {
  const { Router } = express;
  const eventsRouter: express.Router = Router();

  eventsRouter.post('/', mcc.publishEvent.bind(mcc));

  return eventsRouter;
};

export default createEventsRouter;
