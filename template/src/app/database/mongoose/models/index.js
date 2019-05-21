import fs from 'fs';

let toSkip = ['index.js'];

module.exports = exports = function(db) {
  let modelFiles = fs.readdirSync(__dirname);

  let modelsObject = {};

  for (let file of modelFiles) {
    if (toSkip.indexOf(file) > -1) continue;

    let modelGenerator = require(`./${file}`);
    let model = modelGenerator(db);

    modelsObject[model.modelName] = model;
  }

  return modelsObject;
};
