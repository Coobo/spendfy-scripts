if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';

const { app: logger } = require('@coobo/spendfy-logger');

if (process.env.NODE_ENV === 'development') {
  logger.info({
    message: 'Loading .env file.',
    NODE_ENV: process.env.NODE_ENV
  });
  require('dotenv').config();
}

const application = require('./app');

application.listen(process.env.PORT, () => {
  logger.info({
    message: `${process.env.APP_NAME} is running`,
    port: process.env.PORT
  });
});
