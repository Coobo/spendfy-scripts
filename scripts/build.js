if (!process.env.BABEL_ENV) process.env.BABEL_ENV = 'production';
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';

const env = process.env.BABEL_ENV || process.env.NODE_ENV;

const paths = require('../config/paths');
require('@babel/register')({
  ignore: ['node_modules/**/node_modules', 'node_modules'],
  only: [paths.appPath],
  extensions: ['.js'],
  rootMode: 'upward',
  root: appPath,
  sourceMaps: env === 'development'
});

require(`${paths.appPath}/src/app.js`);
