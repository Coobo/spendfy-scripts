import fs from 'fs';
import path from 'path';
import { app as logger } from '@coobo/spendfy-logger';

let migrationsPath = path.join(__dirname, 'migrations/');

const fetchMigrations = (basePath = migrationsPath) => {
  let migrationFiles = fs.readdirSync(basePath);

  return migrationFiles.sort();
};

const filterMigrationsToRun = async (
  migrationModel,
  migrationsNames = null
) => {
  if (!migrationsNames) migrationsNames = fetchMigrations();
  let doneMigrations = await migrationModel.find();
  let doneMigrationsNames = doneMigrations.map((migration) => migration.name);
  return migrationsNames.filter(
    (migrationName) => doneMigrationsNames.indexOf(migrationName) < 0
  );
};

const loadMigrations = (migrationNames, basePath = migrationsPath) => {
  return migrationNames.map((migrationName) => {
    let migrationData = require(path.join(basePath, migrationName));
    return { ...migrationData, name: migrationName };
  });
};

const runUpHook = async (migration, db, force = false) => {
  logger.debug({
    message: 'Running migration',
    migration: migration.name,
    force
  });
  let migrationHasRun = await db.Migration.findOne({ name: migration.name });
  if (!force) {
    if (migrationHasRun) {
      logger.debug({
        message:
          'Migration has previously ran and force was set to false. Skipping...',
        migration: migration.name
      });
      return true;
    }
  }

  try {
    await migration.up(db);
    if (!migrationHasRun) await db.Migration.create({ name: migration.name });
    else await migrationHasRun.update({ ranAt: Date.now() });
    logger.debug('Migration ran successfully');
    return true;
  } catch (e) {
    throw e;
  }
};

const runDownHook = async (migration, db) => {
  logger.debug({
    message: 'Dropping migration',
    migration: migration.name
  });
  let migrationHasRun = await db.Migration.findOne({ name: migration.name });

  if (migrationHasRun) {
    try {
      await migration.down(db);
      await db.Migration.findOneAndDelete({ name: migration.name });
      logger.debug('Migration dropped successfully');
      return true;
    } catch (e) {
      throw e;
    }
  } else return false;
};

const run = async (database, up = true, down = false) => {
  let migrationsFiles = fetchMigrations();
  // let migrationsToRun = await filterMigrationsToRun(
  //   database.Migration,
  //   migrationsFiles
  // );
  let migrations = loadMigrations(migrationsFiles);
  for (let migration of migrations) {
    if (up) {
      try {
        await runUpHook(migration, database);
      } catch (e) {
        throw e;
      }
    }
    if (down) {
      try {
        await runDownHook(migration, database);
      } catch (e) {
        throw e;
      }
    }
  }
};

exports.migrationsPath = migrationsPath;
exports.fetchMigrations = fetchMigrations;
exports.loadMigrations = loadMigrations;
exports.filterMigrationsToRun = filterMigrationsToRun;
exports.up = runUpHook;
exports.down = runDownHook;
exports.run = run;
