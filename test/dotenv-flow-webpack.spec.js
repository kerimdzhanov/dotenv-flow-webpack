'use strict';

const {expect} = require('chai');
const sinon = require('sinon');
const fs = require('fs');

const {DefinePlugin} = require('webpack');
const DotenvFlow = require('../lib/dotenv-flow-webpack');

function isolateProcessEnv() {
  let processEnvBackup;

  before('backup the original `process.env` object', () => {
    processEnvBackup = process.env;
  });

  beforeEach('setup the `process.env` copy', () => {
    process.env = { ...processEnvBackup };
  });

  after('restore the original `process.env` object', () => {
    process.env = processEnvBackup;
  });
}

describe('dotenv-flow-webpack', () => {
  let $dotenvFiles;

  beforeEach('init the `$dotenvFiles` stub', () => {
    $dotenvFiles = {};
  });

  let $existsSync;

  beforeEach('stub `fs.existsSync`', () => {
    $existsSync = sinon.stub(fs, 'existsSync')
      .callsFake(filename => $dotenvFiles.hasOwnProperty(filename));
  });

  afterEach(() => $existsSync.restore());

  let $readFileSync;

  beforeEach('stub `fs.readFileSync`', () => {
    $readFileSync = sinon.stub(fs, 'readFileSync')
      .callsFake((filename) => {
        if (!$dotenvFiles.hasOwnProperty(filename)) {
          throw new Error(`file "${filename}" doesn't exist`);
        }

        return $dotenvFiles[filename];
      });
  });

  afterEach(() => $readFileSync.restore());

  let $processCwd;

  beforeEach('stub `process.cwd`', () => {
    $processCwd = sinon.stub(process, 'cwd')
      .returns('/path/to/project');
  });

  afterEach(() => $processCwd.restore());

  it('is an instance of `webpack.DefinePlugin`', () => {
    expect(new DotenvFlow()).is.an.instanceOf(DefinePlugin);
  });

  describe('by default (when no options are given)', () => {
    it('loads the default `.env` file', () => {
      $dotenvFiles['/path/to/project/.env'] = 'DEFAULT_ENV_VAR=ok';

      const plugin = new DotenvFlow();

      expect(plugin.definitions)
        .to.deep.equal({
          'process.env.DEFAULT_ENV_VAR': JSON.stringify('ok')
        });
    });

    it('loads the `.env.local` file', () => {
      $dotenvFiles['/path/to/project/.env.local'] = 'LOCAL_ENV_VAR=ok';

      const plugin = new DotenvFlow();

      expect(plugin.definitions)
        .to.deep.equal({
          'process.env.LOCAL_ENV_VAR': JSON.stringify('ok')
        });
    });

    it('uses `process.cwd()` as a default `path`', () => {
      $processCwd.returns('/current/working/directory');

      $dotenvFiles['/current/working/directory/.env'] = 'DEFAULT_ENV_VAR=ok';

      const plugin = new DotenvFlow();

      expect($processCwd)
        .to.have.been.calledOnce;

      expect(plugin.definitions)
        .to.deep.equal({
          'process.env.DEFAULT_ENV_VAR': JSON.stringify('ok')
        });
    });
  });

  describe('when the `NODE_ENV` environment variable is present', () => {
    isolateProcessEnv();

    beforeEach('setup the `NODE_ENV` environment variable', () => {
      process.env.NODE_ENV = 'development';
    });

    it('loads the default `.env` file', () => {
      $dotenvFiles['/path/to/project/.env'] = 'DEFAULT_ENV_VAR=ok';

      const plugin = new DotenvFlow();

      expect(plugin.definitions)
        .to.deep.equal({
          'process.env.DEFAULT_ENV_VAR': JSON.stringify('ok')
        });
    });

    it('loads the `.env.local` file', () => {
      $dotenvFiles['/path/to/project/.env.local'] = 'LOCAL_ENV_VAR=ok';

      const plugin = new DotenvFlow();

      expect(plugin.definitions)
        .to.deep.equal({
          'process.env.LOCAL_ENV_VAR': JSON.stringify('ok')
        });
    });

    it('loads the node_env-specific env file', () => {
      $dotenvFiles['/path/to/project/.env.development'] = 'DEVELOPMENT_ENV_VAR=ok';

      const plugin = new DotenvFlow();

      expect(plugin.definitions)
        .to.deep.equal({
          'process.env.DEVELOPMENT_ENV_VAR': JSON.stringify('ok')
        });
    });

    it('loads the node_env-specific local env file', () => {
      $dotenvFiles['/path/to/project/.env.development.local'] = 'DEVELOPMENT_LOCAL_ENV_VAR=ok';

      const plugin = new DotenvFlow();

      expect(plugin.definitions)
        .to.deep.equal({
          'process.env.DEVELOPMENT_LOCAL_ENV_VAR': JSON.stringify('ok')
        });
    });
  });

  describe('when the `node_env` option is given', () => {
    isolateProcessEnv();

    it('loads the default `.env` file', () => {
      $dotenvFiles['/path/to/project/.env'] = 'DEFAULT_ENV_VAR=ok';

      const plugin = new DotenvFlow({
        node_env: 'development'
      });

      expect(plugin.definitions)
        .to.deep.equal({
          'process.env.DEFAULT_ENV_VAR': JSON.stringify('ok')
        });
    });

    it('loads the `.env.local` file', () => {
      $dotenvFiles['/path/to/project/.env.local'] = 'LOCAL_ENV_VAR=ok';

      const plugin = new DotenvFlow({
        node_env: 'development'
      });

      expect(plugin.definitions)
        .to.deep.equal({
          'process.env.LOCAL_ENV_VAR': JSON.stringify('ok')
        });
    });

    it('loads the node_env-specific env file', () => {
      $dotenvFiles['/path/to/project/.env.development'] = 'DEVELOPMENT_ENV_VAR=ok';

      const plugin = new DotenvFlow({
        node_env: 'development'
      });

      expect(plugin.definitions)
        .to.deep.equal({
          'process.env.DEVELOPMENT_ENV_VAR': JSON.stringify('ok')
        });
    });

    it('loads the node_env-specific local env file', () => {
      $dotenvFiles['/path/to/project/.env.development.local'] = 'DEVELOPMENT_LOCAL_ENV_VAR=ok';

      const plugin = new DotenvFlow({
        node_env: 'development'
      });

      expect(plugin.definitions)
        .to.deep.equal({
          'process.env.DEVELOPMENT_LOCAL_ENV_VAR': JSON.stringify('ok')
        });
    });

    it('ignores the `NODE_ENV` environment variable', () => {
      $dotenvFiles['/path/to/project/.env.development'] = 'DEVELOPMENT_ENV_VAR=ok';
      $dotenvFiles['/path/to/project/.env.production'] = 'PRODUCTION_ENV_VAR=ok';

      process.env.NODE_ENV = 'development';

      const plugin = new DotenvFlow({
        node_env: 'production'
      });

      expect(plugin.definitions)
        .to.deep.equal({
          'process.env.PRODUCTION_ENV_VAR': JSON.stringify('ok')
        });
    });
  });

  describe('when the `default_node_env` option is given', () => {
    isolateProcessEnv();

    it('loads the default `.env` file', () => {
      $dotenvFiles['/path/to/project/.env'] = 'DEFAULT_ENV_VAR=ok';

      const plugin = new DotenvFlow({
        default_node_env: 'development'
      });

      expect(plugin.definitions)
        .to.deep.equal({
          'process.env.DEFAULT_ENV_VAR': JSON.stringify('ok')
        });
    });

    it('loads the `.env.local` file', () => {
      $dotenvFiles['/path/to/project/.env.local'] = 'LOCAL_ENV_VAR=ok';

      const plugin = new DotenvFlow({
        default_node_env: 'development'
      });

      expect(plugin.definitions)
        .to.deep.equal({
          'process.env.LOCAL_ENV_VAR': JSON.stringify('ok')
        });
    });

    it('loads the node_env-specific env file', () => {
      $dotenvFiles['/path/to/project/.env.development'] = 'DEVELOPMENT_ENV_VAR=ok';

      const plugin = new DotenvFlow({
        default_node_env: 'development'
      });

      expect(plugin.definitions)
        .to.deep.equal({
          'process.env.DEVELOPMENT_ENV_VAR': JSON.stringify('ok')
        });
    });

    it('loads the node_env-specific local env file', () => {
      $dotenvFiles['/path/to/project/.env.development.local'] = 'DEVELOPMENT_LOCAL_ENV_VAR=ok';

      const plugin = new DotenvFlow({
        default_node_env: 'development'
      });

      expect(plugin.definitions)
        .to.deep.equal({
          'process.env.DEVELOPMENT_LOCAL_ENV_VAR': JSON.stringify('ok')
        });
    });

    it('respects the `NODE_ENV` environment variable', () => {
      $dotenvFiles['/path/to/project/.env.development'] = 'DEVELOPMENT_ENV_VAR=ok';
      $dotenvFiles['/path/to/project/.env.production'] = 'PRODUCTION_ENV_VAR=ok';

      process.env.NODE_ENV = 'production';

      const plugin = new DotenvFlow({
        default_node_env: 'development'
      });

      expect(plugin.definitions)
        .to.deep.equal({
          'process.env.PRODUCTION_ENV_VAR': JSON.stringify('ok')
        });
    });
  });

  describe('when the `path` option is given', () => {
    it('uses the given `path` for listing the `.env*` files', () => {
      $dotenvFiles['/custom/working/directory/.env'] = 'DEFAULT_ENV_VAR=ok';

      const plugin = new DotenvFlow({
        path: '/custom/working/directory'
      });

      expect($processCwd)
        .to.have.not.been.called;

      expect(plugin.definitions)
        .to.deep.equal({
          'process.env.DEFAULT_ENV_VAR': JSON.stringify('ok')
        });
    });
  });

  describe('when the `encoding` option is given', () => {
    it('provides the given `encoding` to `dotenvFlow.parse`', () => {
      $dotenvFiles['/path/to/project/.env'] = 'DEFAULT_ENV_VAR=ok';

      new DotenvFlow({
        encoding: 'base64'
      });

      expect($readFileSync)
        .to.have.been.calledWith('/path/to/project/.env', { encoding: 'base64' });
    });
  });

  describe('when the `system_vars` option is given', () => {
    isolateProcessEnv();

    let $consoleWarn;

    beforeEach('stub `console.warn`', () => {
      $consoleWarn = sinon.stub(console, 'warn');
    });

    afterEach(() => $consoleWarn.restore());

    describe('when the `silent` option is not given', () => {
      it('loads system environment variables', () => {
        process.env.SYSTEM_ENV_VAR = 'ok';

        $dotenvFiles['/path/to/project/.env'] = 'DEFAULT_ENV_VAR=ok';

        const plugin = new DotenvFlow({
          system_vars: true
        });

        expect(plugin.definitions)
          .to.include({
            'process.env.DEFAULT_ENV_VAR': JSON.stringify('ok'),
            'process.env.SYSTEM_ENV_VAR': JSON.stringify('ok')
          });
      });

      it('prioritizes system environment variables', () => {
        process.env.DEFAULT_ENV_VAR = 'predefined';

        $dotenvFiles['/path/to/project/.env'] = 'DEFAULT_ENV_VAR="defined by `.env`"';

        const plugin = new DotenvFlow({
          system_vars: true
        });

        expect(plugin.definitions)
          .to.have.property('process.env.DEFAULT_ENV_VAR')
          .that.equals(JSON.stringify('predefined'));
      });

      it('warns about the system environment variable that overwrites an existing one', () => {
        process.env.DEFAULT_ENV_VAR = 'predefined';

        $dotenvFiles['/path/to/project/.env'] = 'DEFAULT_ENV_VAR="defined by `.env`"';

        new DotenvFlow({
          system_vars: true
        });

        expect($consoleWarn)
          .to.have.been.calledWith(
            'dotenv-flow-webpack: "%s" is overwritten by the system environment variable with the same name',
            'DEFAULT_ENV_VAR'
          );
      });
    });

    describe('when the `silent` option is set to `true`', () => {
      it('loads system environment variables', () => {
        process.env.SYSTEM_ENV_VAR = 'ok';

        $dotenvFiles['/path/to/project/.env'] = 'DEFAULT_ENV_VAR=ok';

        const plugin = new DotenvFlow({
          system_vars: true,
          silent: true
        });

        expect(plugin.definitions)
          .to.include({
            'process.env.DEFAULT_ENV_VAR': JSON.stringify('ok'),
            'process.env.SYSTEM_ENV_VAR': JSON.stringify('ok')
          });
      });

      it('prioritizes system environment variables', () => {
        process.env.DEFAULT_ENV_VAR = 'predefined';

        $dotenvFiles['/path/to/project/.env'] = 'DEFAULT_ENV_VAR="defined by `.env`"';

        const plugin = new DotenvFlow({
          system_vars: true,
          silent: true
        });

        expect(plugin.definitions)
          .to.have.property('process.env.DEFAULT_ENV_VAR')
          .that.equals(JSON.stringify('predefined'));
      });

      it("doesn't print any warnings", () => {
        process.env.DEFAULT_ENV_VAR = 'predefined';

        $dotenvFiles['/path/to/project/.env'] = 'DEFAULT_ENV_VAR="defined by `.env`"';

        new DotenvFlow({
          system_vars: true,
          silent: true
        });

        expect($consoleWarn)
          .to.have.not.been.called;
      });
    });
  });

  describe('if the parsing is failed', () => {
    beforeEach('stub the `.env*` files contents', () => {
      $dotenvFiles['/path/to/project/.env'] = 'DEFAULT_ENV_VAR=ok';
      $dotenvFiles['/path/to/project/.env.local'] = 'LOCAL_ENV_VAR=ok';
    });

    beforeEach('stub `fs.readFileSync` error', () => {
      $readFileSync
        .withArgs('/path/to/project/.env.local')
        .throws(new Error('file reading error stub'));
    });

    let $consoleError;

    beforeEach('stub `console.error`', () => {
      $consoleError = sinon.stub(console, 'error');
    });

    afterEach(() => $consoleError.restore());

    describe('by default (when the `silent` options is not given)', () => {
      it('prints the occurred error message to the console', () => {
        new DotenvFlow();

        expect($consoleError)
          .to.have.been.calledWith('dotenv-flow-webpack:', 'file reading error stub');
      });
    });

    describe('when the `silent` option is set to `true`', () => {
      it("doesn't print any errors", () => {
        new DotenvFlow({
          silent: true
        });

        expect($consoleError)
          .to.have.not.been.called;
      });
    });
  });
});
