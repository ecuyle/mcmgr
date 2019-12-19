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
import { Application } from 'express';
import { Logger } from 'pino';
import { MCEventBusInterface } from '../types/MCEventBus';
import { MCEventBus } from './pubsub/MCEventBus';
import { MCControllerInterface } from '../types/MCController';
import { SECRETS } from './config/secrets';
import expressWs = require('express-ws');
import * as ws from 'ws';

interface RouterWs extends express.Router {
  ws(route: string, ...cb: any[]): RouterWs;
}

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

app.use(cookieParser());
app.use(bodyParser.json());
app.use(expressPinoLogger({ logger }));
app.use(session({ secret: SECRETS.SESSION_SECRET }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(cors({ origin: 'http://localhost:8081', credentials: true }));

// Routes
// Auth
app.post('/api/login', passport.authenticate('local'), function(req, res) {
  console.log('success');
  res.send(req.user);
});

app.get('/api/logout', function(req, res) {
  req.logout();
  res.send();
});

// MCUser
app.get('/api/mcusr', mcc.getUserById.bind(mcc));
app.post('/api/mcusr', mcc.createUser.bind(mcc));

app.get('/api/mcsrv', isLoggedIn, mcc.getServersByUserId.bind(mcc));
app.post('/api/mcsrv', mcc.createServer.bind(mcc));
app.put('/api/mcsrv', mcc.updateServerConfig.bind(mcc));

app.get('/api/mcsrv/detail', mcc.getServerDetails.bind(mcc));

app.post('/api/events', mcc.publishEvent.bind(mcc));

wsRouter.ws('/connect', mcc.connect.bind(mcc));

app.use('/api/ws', wsRouter);

app.listen(PORT, () => {
  logger.info(`Server running on port: ${PORT}`);
});
