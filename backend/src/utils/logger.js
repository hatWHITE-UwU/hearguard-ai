'use strict';

const { createLogger, format, transports } = require('winston');

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

const logger = createLogger({
  level: isProduction ? 'info' : 'debug',
  silent: isTest,
  format: isProduction
    ? format.combine(format.timestamp(), format.json())
    : format.combine(format.colorize(), format.simple()),
  transports: [new transports.Console()],
});

module.exports = logger;
