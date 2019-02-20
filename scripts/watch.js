'use strict';

process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

process.on('unhandledRejection', (err) => {
  throw err;
});

const nodemon = require('nodemon');
const paths = require('../config/paths');
const path = require('path');
const chalk = require('chalk');

nodemon({
  restartable: 'rs',
  ignore: ['.git', 'node_modules/**/node_modules', '.test.js'],
  verbose: true,
  watch: [path.join(paths.appPath, 'src/')],
  env: {
    NODE_ENV: 'development'
  },
  ext: 'js,json',
  exec: `cd ${paths.appPath} && yarn run build && yarn start`
});

nodemon
  .on('start', () => console.log(chalk.green('Service has started')))
  .on('quit', () => console.log(chalk.orange('Service has quit.')))
  .on('restart', (files) =>
    console.log(chalk.cyan('Service restarted due to: ', files))
  );
