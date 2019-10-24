import express = require('express');
import bodyParser = require('body-parser');
import pino = require('pino');
import expressPinoLogger = require('express-pino-logger');
import chalk from 'chalk';

import { createServer } from './controllers';

import { Application } from 'express';
import { Logger } from 'pino';

const app: Application = express();
const logger: Logger = pino();
const PORT: string = process.env.PORT || '3000';

app.use(bodyParser.json());
app.use(expressPinoLogger({ logger }));

app.post('/createServer', createServer);

app.listen(PORT, () => {
    logger.info(chalk.green(`Server running on port: ${PORT}`));
});
