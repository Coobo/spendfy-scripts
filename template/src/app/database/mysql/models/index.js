'use strict';
const { app } = require('@coobo/spendfy-logger');
var logger = app;
var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var basename = path.basename(__filename);
var globalname = 'defineGlobals.js';
var env = process.env.NODE_ENV || 'development';
var config = require(__dirname + '/../config.js')[env];
var globals = require(__dirname + '/defineGlobals.js');
var db = {};

var sequelize;

logger.profile('MYSQL_CONFIGURATION');

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, {
    ...config,
    operatorsAliases: false
  });
}

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file !== globalname &&
      file.slice(-3) === '.js'
    );
  })
  .forEach((file) => {
    var model = sequelize['import'](path.join(__dirname, file));
    globals.defineScopes(model);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

globals.defineHooks(db.sequelize);

logger.profile('MYSQL_CONFIGURATION', { level: 'silly' });

module.exports = db;
