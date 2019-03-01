import App from '@coobo/skeleton';
import Router from './api/router';

var application = new App({
  port: process.env.PORT,
  cors: {
    origin:
      process.env.ALLOWED_ORIGINS.indexOf(',') > -1
        ? process.env.ALLOWED_ORIGINS.split(',')
        : [process.env.ALLOWED_ORIGINS]
  },
  enableCors: true
});

application.use(Router);

module.exports = exports = application;
