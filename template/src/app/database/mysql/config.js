const chalk = require('chalk');
const yn = require('yn');
const { sql: logger } = require('@coobo/spendfy-logger');

function styleArrsAndDots(value) {
  if (value.indexOf('->') > -1) {
    let [main, ...targets] = value.split('->');
    main = chalk.green(main);
    for (let id in targets) {
      targets[id] = styleArrsAndDots(targets[id]);
    }
    return main + '->' + targets.join('->');
  }
  if (value.indexOf('.') > -1) {
    let [main, ...targets] = value.split('.');
    main = chalk.blue(main);
    for (let id in targets) {
      targets[id] = styleArrsAndDots(targets[id]);
    }
    return main + '.' + targets.join('.');
  }
  return chalk.gray(value);
}

function highlight(string) {
  string = string.replace(
    'Executing (default):',
    chalk.bold('Executing (default):')
  );
  // string = string.replace(/= ?(.*?) |;/gm, value => chalk.yellow.bold(value));
  // string = string.replace(/=/gm, value => chalk.keyword('orange')(value));
  // string = string.replace(/(->)|(\.)/gm, value => chalk.red(value));
  // string = string.replace(/`{1}(.*?)`{1}/gm, value => chalk.green.bold(value));
  // string = string.replace(/( [Aa][Ss] )|( [Oo][Nn] )/gm, value =>
  //   chalk.blue.bold(value)
  // );
  let list = [
    {
      regex: [/\(/gm],
      callback: (value) => value + '  '
    },
    {
      regex: [/,/gm, /\(/gm],
      callback: (value) => value
    },
    {
      regex: [
        /FROM/gm,
        /INTO/gm,
        /WHERE/gm,
        /LEFT OUTER JOIN/gm,
        /INNER JOIN/gm,
        /\)/gm
      ],
      callback: (value) => value
    },
    {
      regex: [
        /SELECT/gm,
        /INSERT/gm,
        /DELETE/gm,
        /UPDATE/gm,
        /LEFT/gm,
        /RIGHT/gm,
        /INNER/gm,
        /OUTER/gm,
        /JOIN/gm,
        /\)/gm,
        /\(/gm
      ],
      callback: (value) => chalk.red(value)
    },
    {
      regex: [/AS/gm, /ON/gm, /FROM/gm, /INTO/gm, /WHERE/gm, /AND/gm],
      callback: (value) => chalk.cyan(value)
    },
    {
      regex: [/`.*?\..*?`/gm, /`.*?`.`.*?`/gm],
      callback: (value) => styleArrsAndDots(value)
    },
    {
      regex: [/`.*?`/gm],
      callback: (value) => chalk.green(value)
    },
    {
      regex: [/\n/gm],
      callback: (value) => value + '  '
    }
  ];
  for (let item of list) {
    for (let regex of item.regex) {
      string = string.replace(regex, item.callback);
    }
  }
  return string;
}

function log(string, query) {
  string = highlight(string);
  if (typeof logger[query.type] === 'function')
    logger[query.type]({ message: 'Executing Query', query: string });
  else console.log(string);
}

console.log(process.env.NODE_ENV);

module.exports = {
  development: {
    username: process.env.SEQUELIZE_USERNAME,
    password: process.env.SEQUELIZE_PASSWORD,
    database: process.env.SEQUELIZE_DATABASE,
    host: process.env.SEQUELIZE_HOST,
    dialect: process.env.SEQUELIZE_DIALECT,
    port: process.env.SEQUELIZE_PORT,
    seederStorage: process.env.SEQUELIZE_SEEDER_STORAGE,
    seederStorageTableName: process.env.SEQUELIZE_SEEDER_STORAGE_TABLENAME,
    migrationStorageTableName:
      process.env.SEQUELIZE_MIGRATION_STORAGE_TABLENAME,
    logging: log //yn(process.env.SEQUELIZE_LOGGING) ? log : false
  },
  staging: {
    username: process.env.SEQUELIZE_USERNAME,
    password: process.env.SEQUELIZE_PASSWORD,
    database: process.env.SEQUELIZE_DATABASE,
    host: process.env.SEQUELIZE_HOST,
    dialect: process.env.SEQUELIZE_DIALECT,
    port: process.env.SEQUELIZE_PORT,
    seederStorage: process.env.SEQUELIZE_SEEDER_STORAGE,
    seederStorageTableName: process.env.SEQUELIZE_SEEDER_STORAGE_TABLENAME,
    migrationStorageTableName:
      process.env.SEQUELIZE_MIGRATION_STORAGE_TABLENAME,
    logging: yn(process.env.SEQUELIZE_LOGGING) ? console.log : false
  },
  production: {
    username: process.env.SEQUELIZE_USERNAME,
    password: process.env.SEQUELIZE_PASSWORD,
    database: process.env.SEQUELIZE_DATABASE,
    host: process.env.SEQUELIZE_HOST,
    dialect: process.env.SEQUELIZE_DIALECT,
    port: process.env.SEQUELIZE_PORT,
    seederStorage: process.env.SEQUELIZE_SEEDER_STORAGE,
    seederStorageTableName: process.env.SEQUELIZE_SEEDER_STORAGE_TABLENAME,
    migrationStorageTableName:
      process.env.SEQUELIZE_MIGRATION_STORAGE_TABLENAME,
    logging: yn(process.env.SEQUELIZE_LOGGING) ? console.log : false
  },
  testing: {
    username: process.env.SEQUELIZE_USERNAME,
    password: process.env.SEQUELIZE_PASSWORD,
    database: process.env.SEQUELIZE_DATABASE,
    host: process.env.SEQUELIZE_HOST,
    dialect: process.env.SEQUELIZE_DIALECT,
    port: process.env.SEQUELIZE_PORT,
    seederStorage: process.env.SEQUELIZE_SEEDER_STORAGE,
    seederStorageTableName: process.env.SEQUELIZE_SEEDER_STORAGE_TABLENAME,
    migrationStorageTableName:
      process.env.SEQUELIZE_MIGRATION_STORAGE_TABLENAME,
    logging: false //yn(process.env.SEQUELIZE_LOGGING) ? console.log : false
  }
};
