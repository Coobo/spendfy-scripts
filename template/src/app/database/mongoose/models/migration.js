import uuidv4 from 'uuid/v4';
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let MigrationSchema = new Schema(
  {
    _id: { type: String, required: true, default: uuidv4 },
    name: { type: String, required: true },
    runAt: { type: Date, required: true, default: Date.now() }
  },
  { collection: 'migration', strict: true }
);

module.exports = exports = (db) => {
  let migrationModel = db.model('Migration', MigrationSchema);

  return migrationModel;
};
