import App from '@coobo/skeleton';
import Router from './api/router';

var application = new App({
  port: process.env.PORT
});

application.use(Router);

module.exports = exports = application;
