import mongoose from 'mongoose';
import { app as logger } from '@coobo/spendfy-logger';
import models from './models';
import migration from './migration';
import connectionString from './connection_string';

let db = new mongoose.Mongoose();

logger.profile('MONGODB_CONNECT_TIME');
db.connect(connectionString, { useNewUrlParser: true }).then(() =>
  logger.profile('MONGODB_CONNECT_TIME', { level: 'silly' })
);

let MongooseDatabase = { db, ...models(db) };

migration.run(MongooseDatabase, true, false);

export default MongooseDatabase;
exports.migrationSystem = migration;
exports.disconnect = async () => {
  await db.connection.close();
  return true;
};

exports.connect = async () => {
  await db.connect(connectionString);
  return true;
};
