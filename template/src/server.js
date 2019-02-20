if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';
if (process.env.NODE_ENV === 'development') {
  const { app: logger } = require('@coobo/spendfy-logger');

  logger.info({
    message: 'Loading .env file.',
    NODE_ENV: process.env.NODE_ENV
  });
  require('dotenv').config();
}
const application = require('./app');
application.listen(process.env.PORT);
