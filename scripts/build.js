if (!process.env.BABEL_ENV) process.env.BABEL_ENV = 'production';
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';

const env = process.env.BABEL_ENV || process.env.NODE_ENV;

const paths = require('../config/paths');
const path = require('path');
const chalk = require('chalk');

const compiler = require('@coobo/compiler').compiler;
// console.log('from', [path.join(paths.appPath, './src/')]);
// console.log('to', path.join(paths.appPath, './dist/'));
// console.log('basePath', path.resolve(__dirname, './../'));
compiler({
  basePath: path.resolve(__dirname, './../'),
  outDir: path.join(paths.appPath, './dist/'),
  verbose: true,
  filenames: [path.join(paths.appPath, './src/')]
});
