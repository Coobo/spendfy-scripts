'use strict';

process.on('unhandledRejection', (err) => {
  throw err;
});

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const execSync = require('child_process').execSync;
const spawn = require('cross-spawn');
const os = require('os');

function isInGitRepository() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

function isInMercurialRepository() {
  try {
    execSync('hg --cwd . root', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

function tryGitInit(appPath) {
  let didInit = false;
  try {
    execSync('git --version', { stdio: 'ignore' });
    if (isInGitRepository() || isInMercurialRepository()) {
      return false;
    }

    execSync('git init', { stdio: 'ignore' });
    didInit = true;

    execSync('git add -A', { stdio: 'ignore' });
    execSync('git commit -m "Initial commit from Create Spendfy Service"', {
      stdio: 'ignore'
    });
    return true;
  } catch (e) {
    if (didInit) {
      try {
        fs.removeSync(path.join(appPath, '.git'));
      } catch (removeErr) {
        // Ignore.
      }
    }
    return false;
  }
}

module.exports = function(
  appPath,
  appName,
  verbose,
  originalDirectory,
  template
) {
  const ownPath = path.dirname(
    require.resolve(path.join(__dirname, '..', 'package.json'))
  );
  const appPackage = require(path.join(appPath, 'package.json'));
  const useYarn = fs.existsSync(path.join(appPath, 'yarn.lock'));

  // Copy over some of the devDependencies
  appPackage.dependencies = appPackage.dependencies || {};

  // Setup the script rules
  appPackage.scripts = {
    watch: 'spendfy-scripts watch',
    build: 'spendfy-scripts build',
    test: 'yarn run build && jest --env=node',
    'test:watch': 'yarn run build && jest --env=node --watch',
    'test:coverage': 'yarn run build && jest --env=node --coverage',
    'test:memory': 'yarn run build && jest --env=node --logHeapUsage',
    start: 'node dist/server.js'
  };

  // Setup the eslint config
  appPackage.eslintConfig = {
    env: {
      es6: true,
      node: true,
      jest: true
    },
    extends: 'eslint:recommended',
    parser: 'babel-eslint',
    parserOptions: {
      ecmaVersion: 2018,
      sourceType: 'module'
    },
    rules: {
      indent: ['error', 2],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'no-console': 0
    }
  };

  // Setup the prettier config
  appPackage.prettier = {
    tabWidth: 2,
    printWidth: 80,
    useTabs: false,
    singleQuote: true,
    semi: true,
    trailingComma: 'none',
    bracketSpacing: true,
    arrowParens: 'always'
  };

  fs.writeFileSync(
    path.join(appPath, 'package.json'),
    JSON.stringify(appPackage, null, 2) + os.EOL
  );

  const readmeExists = fs.existsSync(path.join(appPath, 'README.md'));
  if (readmeExists) {
    fs.renameSync(
      path.join(appPath, 'README.md'),
      path.join(appPath, 'README.old.md')
    );
  }

  // Copy the files for the user
  const templatePath = template
    ? path.resolve(originalDirectory, template)
    : path.join(ownPath, 'template');
  if (fs.existsSync(templatePath)) {
    fs.copySync(templatePath, appPath);
  } else {
    console.error(
      `Could not locate supplied template: ${chalk.green(templatePath)}`
    );
    return;
  }

  try {
    fs.moveSync(
      path.join(appPath, 'gitignore'),
      path.join(appPath, '.gitignore'),
      []
    );
  } catch (err) {
    // Append if there's already a `.gitignore` file there
    if (err.code === 'EEXIST') {
      const data = fs.readFileSync(path.join(appPath, 'gitignore'));
      fs.appendFileSync(path.join(appPath, '.gitignore'), data);
      fs.unlinkSync(path.join(appPath, 'gitignore'));
    } else {
      throw err;
    }
  }

  let command;
  let args;

  if (useYarn) {
    command = 'yarnpkg';
    args = ['add'];
  } else {
    command = 'npm';
    args = ['install', '--save', verbose && '--verbose'].filter((e) => e);
  }
  args.push(...require('./utils/dependencies.json'));

  // Install additional template dependencies, if present
  const templateDependenciesPath = path.join(
    appPath,
    '.template.dependencies.json'
  );
  if (fs.existsSync(templateDependenciesPath)) {
    const templateDependencies = require(templateDependenciesPath).dependencies;
    args = args.concat(
      Object.keys(templateDependencies).map((key) => {
        return `${key}@${templateDependencies[key]}`;
      })
    );
    fs.unlinkSync(templateDependenciesPath);
  }

  if (!isSpendfyInstalled(appPackage) || template) {
    console.log(`Installing dependencies using ${command}...`);
    console.log();

    const proc = spawn.sync(command, args, { stdio: 'inherit' });
    if (proc.status !== 0) {
      console.error(`\`${command} ${args.join(' ')}\` failed`);
      return;
    }
  }

  if (tryGitInit(appPath)) {
    console.log();
    console.log('Initialized a git repository.');
  }

  let cdpath;
  if (originalDirectory && path.join(originalDirectory, appName) === appPath) {
    cdpath = appName;
  } else {
    cdpath = appPath;
  }

  const displayedCommand = useYarn ? 'yarn' : 'npm';

  console.log();
  console.log(`Success! Created ${appName} at ${appPath}`);
  console.log('Inside that directory, you can run several commands:');
  console.log();
  console.log(chalk.cyan(`  ${displayedCommand} watch`));
  console.log('    Starts the development server in watch mode.');
  console.log();
  console.log(
    chalk.cyan(`  ${displayedCommand} ${useYarn ? '' : 'run '}build`)
  );
  console.log('    Builds the app for production.');
  console.log();
  console.log(chalk.cyan(`  ${displayedCommand} test`));
  console.log('    Starts the test runner.');
  console.log();
  console.log('We suggest that you begin by typing:');
  console.log();
  console.log(chalk.cyan('  cd'), cdpath);
  console.log(`  ${chalk.cyan(`${displayedCommand} start`)}`);
  if (readmeExists) {
    console.log();
    console.log(
      chalk.yellow(
        'You had a `README.md` file, we renamed it to `README.old.md`'
      )
    );
  }
  console.log();
  console.log('Happy hacking!');
};

function isSpendfyInstalled(appPackage) {
  const dependencies = appPackage.dependencies || {};

  return (
    typeof dependencies['@coobo/skeleton'] !== 'undefined' &&
    typeof dependencies['@coobo/spendfy-logger'] !== 'undefined'
  );
}
