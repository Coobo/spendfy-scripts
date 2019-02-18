const execSync = require('child_process').execSync;

const global = exports;

global.isInGitRepository = function isInGitRepository() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
};

global.isInMercurialRepository = function isInMercurialRepository() {
  try {
    execSync('hg --cwd . root', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
};

global.ownPath = path.dirname(
  require.resolve(path.join(__dirname, '../..', 'package.json'))
);
