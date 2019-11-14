import express = require('express');
import bodyParser = require('body-parser');
import pino = require('pino');
import expressPinoLogger = require('express-pino-logger');

import { 
    getUserById,
    getServersByUserId,
    createServer,
    createUser,
    publishEvent,
} from './controllers';

import { Application } from 'express';
import { Logger } from 'pino';

const app: Application = express();
const logger: Logger = pino();
const PORT: string = process.env.PORT || '3000';

app.use(bodyParser.json());
app.use(expressPinoLogger({ logger }));

app.get('/api/mcusr', getUserById);
app.post('/api/mcusr', createUser);

app.get('/api/mcsrv', getServersByUserId);
app.post('/api/mcsrv', createServer);

app.post('/api/events', publishEvent);

app.listen(PORT, () => {
    logger.info(`Server running on port: ${PORT}`);
});
