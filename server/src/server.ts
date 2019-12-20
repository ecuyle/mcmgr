import express = require('express');
import passport = require('passport');
import flash = require('connect-flash');
import bodyParser = require('body-parser');
import cookieParser = require('cookie-parser');
import session = require('express-session');
import cors = require('cors');
import pino = require('pino');
import expressPinoLogger = require('express-pino-logger');
import { setupPassport, isLoggedIn } from './config/passport';
import { MCController } from './controller';
import { Logger } from 'pino';
import { RouterWs } from '../types/Common';
import { MCEventBusInterface } from '../types/MCEventBus';
import { MCEventBus } from './pubsub/MCEventBus';
import { MCControllerInterface } from '../types/MCController';
import { SECRETS } from './config/secrets';
import expressWs = require('express-ws');

import authRouter from './routers/auth';
import createMcusrRouter from './routers/mcusr';
import createMcsrvRouter from './routers/mcsrv';
import createEventsRouter from './routers/events';

const app = expressWs(express()).app;
const wsRouter = express.Router() as RouterWs;

const logger: Logger = pino();
const PORT: string = process.env.PORT || '3000';
const dataDirPath: string = `${__dirname}/../../../data`;
const eventBus: MCEventBusInterface = new MCEventBus();
const mcc: MCControllerInterface = new MCController(
  logger,
  dataDirPath,
  eventBus
);

setupPassport(passport, mcc);

// Middleware
app.use(cookieParser());
app.use(bodyParser.json());
app.use(expressPinoLogger({ logger }));
app.use(session({ secret: SECRETS.SESSION_SECRET }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// TODO: Gotta find a better way to allow origin with credentials...
app.use(cors({ origin: 'http://localhost:8081', credentials: true }));

// Routers
app.use('/api/auth', authRouter);
app.use('/api/mcusr', createMcusrRouter(mcc));
app.use('/api/mcsrv', createMcsrvRouter(mcc));
app.use('/api/events', createEventsRouter(mcc));

app.post('/api/events', mcc.publishEvent.bind(mcc));

wsRouter.ws('/connect', mcc.connect.bind(mcc));

app.use('/api/ws', wsRouter);

app.listen(PORT, () => {
  logger.info(`Server running on port: ${PORT}`);
});
