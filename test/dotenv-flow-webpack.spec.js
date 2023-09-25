'use strict';

const {expect} = require('chai');
const sinon = require('sinon');
const fs = require('fs');

const {DefinePlugin} = require('webpack');
const DotenvFlow = require('../lib/dotenv-flow-webpack');

describe('dotenv-flow-webpack', () => {
  /**
   * `.env*` files stub.
   *
   * @type {{ [filename: string]: string }}
   */
  let $dotenvFiles = {};

  /**
   * Mock `.env*` files.
   *
   * @param {{[filename: string]: string}} fileMap - a map of `filename => contents`
   */
  function mockFS(fileMap) {
    $dotenvFiles = fileMap;
  }

  afterEach('reset `$dotenvFiles` stub', () => {
    $dotenvFiles = {};
  });

  let $fs_existsSync;

  beforeEach('stub `fs.existsSync`', () => {
    $fs_existsSync = sinon.stub(fs, 'existsSync')
      .callsFake(filename => $dotenvFiles.hasOwnProperty(filename));
  });

  afterEach(() => $fs_existsSync.restore());

  let $fs_readFileSync;

  beforeEach('stub `fs.readFileSync`', () => {
    $fs_readFileSync = sinon.stub(fs, 'readFileSync')
      .callsFake((filename) => {
        if (!$dotenvFiles.hasOwnProperty(filename)) {
          const error = new Error(`ENOENT: no such file or directory, open '${filename}'`);
          error.code = 'ENOENT';
          error.errno = -2;  // ENOENT's numeric error code
          error.syscall = 'read';
          error.path = filename;
          throw error;
        }

        return $dotenvFiles[filename];
      });
  });

  afterEach(() => $fs_readFileSync.restore());

  // --

  let $processCwd;

  beforeEach('stub `process.cwd`', () => {
    $processCwd = sinon.stub(process, 'cwd')
      .returns('/path/to/project');
  });

  afterEach(() => $processCwd.restore());

  // --

  let _processEnvBackup;

  before('backup the original `process.env` object', () => {
    _processEnvBackup = process.env;
  });

  beforeEach('setup the `process.env` copy', () => {
    process.env = { ..._processEnvBackup };
  });

  after('restore the original `process.env` object', () => {
    process.env = _processEnvBackup;
  });

  // --

  it('is an instance of `webpack.DefinePlugin`', () => {
    expect(new DotenvFlow()).is.an.instanceOf(DefinePlugin);
  });

  describe('by default (when no options are given)', () => {
    it('loads the default `.env` file', () => {
      mockFS({
        '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok'
      });

      const plugin = new DotenvFlow();

      expect(plugin.definitions)
        .to.deep.equal({
          'process.env.DEFAULT_ENV_VAR': JSON.stringify('ok')
        });
    });

    it('loads the `.env.local` file', () => {
      mockFS({
        '/path/to/project/.env.local': 'LOCAL_ENV_VAR=ok'
      });

      const plugin = new DotenvFlow();

      expect(plugin.definitions)
        .to.deep.equal({
          'process.env.LOCAL_ENV_VAR': JSON.stringify('ok')
        });
    });

    it("merges parsed files' contents", () => {
      mockFS({
        '/path/to/project/.env': (
          'DEFAULT_ENV_VAR=ok\n' +
          'SHARED_ENV_VAR="should be overwritten by `.env.local`"'
        ),
        '/path/to/project/.env.local': (
          'LOCAL_ENV_VAR=ok\n' +
          'SHARED_ENV_VAR=ok'
        )
      });

      const plugin = new DotenvFlow();

      expect(plugin.definitions)
        .to.deep.equal({
          'process.env.DEFAULT_ENV_VAR': JSON.stringify('ok'),
          'process.env.LOCAL_ENV_VAR': JSON.stringify('ok'),
          'process.env.SHARED_ENV_VAR': JSON.stringify('ok')
        });
    });
  });

  describe('when the `NODE_ENV` environment variable is present', () => {
    beforeEach('setup `process.env.NODE_ENV`', () => {
      process.env.NODE_ENV = 'development';
    });

    it('loads the default `.env` file', () => {
      mockFS({
        '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok'
      });

      const plugin = new DotenvFlow();

      expect(plugin.definitions)
        .to.deep.equal({
          'process.env.DEFAULT_ENV_VAR': JSON.stringify('ok')
        });
    });

    it('loads the `.env.local` file', () => {
      mockFS({
        '/path/to/project/.env.local': 'LOCAL_ENV_VAR=ok'
      });

      const plugin = new DotenvFlow();

      expect(plugin.definitions)
        .to.deep.equal({
          'process.env.LOCAL_ENV_VAR': JSON.stringify('ok')
        });
    });

    it('loads the node_env-specific env file', () => {
      mockFS({
        '/path/to/project/.env.development': 'DEVELOPMENT_ENV_VAR=ok'
      });

      const plugin = new DotenvFlow();

      expect(plugin.definitions)
        .to.deep.equal({
          'process.env.DEVELOPMENT_ENV_VAR': JSON.stringify('ok')
        });
    });

    it('loads the node_env-specific local env file', () => {
      mockFS({
        '/path/to/project/.env.development.local': 'LOCAL_DEVELOPMENT_ENV_VAR=ok'
      });

      const plugin = new DotenvFlow();

      expect(plugin.definitions)
        .to.deep.equal({
          'process.env.LOCAL_DEVELOPMENT_ENV_VAR': JSON.stringify('ok')
        });
    });

    it("merges parsed files' contents", () => {
      mockFS({
        '/path/to/project/.env': (
          'DEFAULT_ENV_VAR=ok\n' +
          'SHARED_ENV_VAR="should be overwritten by `.env.local`"'
        ),

        '/path/to/project/.env.local': (
          'LOCAL_ENV_VAR=ok\n' +
          'SHARED_ENV_VAR="should be overwritten by `.env.development`"'
        ),

        '/path/to/project/.env.development': (
          'DEVELOPMENT_ENV_VAR=ok\n' +
          'SHARED_ENV_VAR="should be overwritten by `.env.development.local`"'
        ),

        '/path/to/project/.env.development.local': (
          'LOCAL_DEVELOPMENT_ENV_VAR=ok\n' +
          'SHARED_ENV_VAR=ok'
        ),
      });

      const plugin = new DotenvFlow();

      expect(plugin.definitions)
        .to.deep.equal({
          'process.env.DEFAULT_ENV_VAR': JSON.stringify('ok'),
          'process.env.LOCAL_ENV_VAR': JSON.stringify('ok'),
          'process.env.DEVELOPMENT_ENV_VAR': JSON.stringify('ok'),
          'process.env.LOCAL_DEVELOPMENT_ENV_VAR': JSON.stringify('ok'),
          'process.env.SHARED_ENV_VAR': JSON.stringify('ok')
        });
    });
  });

  describe('when `options.node_env` is given', () => {
    let options;

    beforeEach('setup `options.node_env`', () => {
      options = { node_env: 'production' };
    });

    it('uses the given `options.node_env` instead of `process.env.NODE_ENV`', () => {
      mockFS({
        '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok',
        '/path/to/project/.env.local': 'LOCAL_ENV_VAR=ok',
        '/path/to/project/.env.production': 'PRODUCTION_ENV_VAR=ok',
        '/path/to/project/.env.production.local': 'LOCAL_PRODUCTION_ENV_VAR=ok'
      });

      process.env.NODE_ENV = 'development';

      const plugin = new DotenvFlow(options);

      expect(plugin.definitions)
        .to.deep.equal({
          'process.env.DEFAULT_ENV_VAR': JSON.stringify('ok'),
          'process.env.LOCAL_ENV_VAR': JSON.stringify('ok'),
          'process.env.PRODUCTION_ENV_VAR': JSON.stringify('ok'),
          'process.env.LOCAL_PRODUCTION_ENV_VAR': JSON.stringify('ok')
        });
    });
  });

  describe('when `options.default_node_env` is given', () => {
    let options;

    beforeEach('setup `options.default_node_env`', () => {
      options = { default_node_env: 'development' };
    });

    it('uses the given environment as default', () => {
      mockFS({
        '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok',
        '/path/to/project/.env.local': 'LOCAL_ENV_VAR=ok',
        '/path/to/project/.env.development': 'DEVELOPMENT_ENV_VAR=ok',
        '/path/to/project/.env.development.local': 'LOCAL_DEVELOPMENT_ENV_VAR=ok'
      });

      const plugin = new DotenvFlow(options);

      expect(plugin.definitions)
        .to.deep.equal({
          'process.env.DEFAULT_ENV_VAR': JSON.stringify('ok'),
          'process.env.LOCAL_ENV_VAR': JSON.stringify('ok'),
          'process.env.DEVELOPMENT_ENV_VAR': JSON.stringify('ok'),
          'process.env.LOCAL_DEVELOPMENT_ENV_VAR': JSON.stringify('ok')
        });
    });

    it('prioritizes the `NODE_ENV` environment variable if present', () => {
      mockFS({
        '/path/to/project/.env.development': 'DEVELOPMENT_ENV_VAR="should not be loaded"',
        '/path/to/project/.env.production': 'PRODUCTION_ENV_VAR=ok'
      });

      process.env.NODE_ENV = 'production';

      const plugin = new DotenvFlow(options);

      expect(plugin.definitions)
        .to.deep.equal({
          'process.env.PRODUCTION_ENV_VAR': JSON.stringify('ok')
        });
    });

    it('prioritizes `options.node_env` if given', () => {
      mockFS({
        '/path/to/project/.env.development': 'DEVELOPMENT_ENV_VAR="should not be loaded"',
        '/path/to/project/.env.production': 'PRODUCTION_ENV_VAR=ok'
      });

      options.node_env = 'production';

      const plugin = new DotenvFlow(options);

      expect(plugin.definitions)
        .to.deep.equal({
          'process.env.PRODUCTION_ENV_VAR': JSON.stringify('ok')
        });
    });
  });

  describe('when `options.path` is given', () => {
    let options;

    beforeEach('setup `options.path`', () => {
      options = { path: '/path/to/another/project' };
    });

    it('uses the given `options.path` as a working directory', () => {
      mockFS({
        '/path/to/another/project/.env': 'DEFAULT_ENV_VAR=ok',
        '/path/to/another/project/.env.local': 'LOCAL_ENV_VAR=ok'
      });

      const plugin = new DotenvFlow(options);

      expect(plugin.definitions)
        .to.deep.equal({
          'process.env.DEFAULT_ENV_VAR': JSON.stringify('ok'),
          'process.env.LOCAL_ENV_VAR': JSON.stringify('ok')
        });
    });
  });

  describe('when `options.pattern` is given', () => {
    let options;

    beforeEach('setup `options.pattern`', () => {
      options = { pattern: '.env/[local/]env[.node_env]' };
    });

    it('reads files by the given `.env*` files naming convention', () => {
      mockFS({
        '/path/to/project/.env/env': 'DEFAULT_ENV_VAR=ok',
        '/path/to/project/.env/env.development': 'DEVELOPMENT_ENV_VAR=ok',
        '/path/to/project/.env/local/env': 'LOCAL_ENV_VAR=ok',
        '/path/to/project/.env/local/env.development': 'LOCAL_DEVELOPMENT_ENV_VAR=ok'
      });

      process.env.NODE_ENV = 'development';

      const plugin = new DotenvFlow(options);

      expect(plugin.definitions)
        .to.deep.equal({
          'process.env.DEFAULT_ENV_VAR': JSON.stringify('ok'),
          'process.env.LOCAL_ENV_VAR': JSON.stringify('ok'),
          'process.env.DEVELOPMENT_ENV_VAR': JSON.stringify('ok'),
          'process.env.LOCAL_DEVELOPMENT_ENV_VAR': JSON.stringify('ok')
        });
    });
  });

  describe('when `options.encoding` is given', () => {
    let options;

    beforeEach('setup `options.encoding`', () => {
      options = { encoding: 'base64' };
    });

    it('provides the given `options.encoding` to `fs.readFileSync()`', () => {
      mockFS({
        '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok',
        '/path/to/project/.env.local': 'LOCAL_ENV_VAR=ok'
      });

      new DotenvFlow(options);

      expect($fs_readFileSync)
        .to.have.been.calledWith('/path/to/project/.env', { encoding: 'base64' });

      expect($fs_readFileSync)
        .to.have.been.calledWith('/path/to/project/.env.local', { encoding: 'base64' });
    });
  });

  describe('when `options.system_vars` is given', () => {
    let options;

    beforeEach('setup `options.system_vars`', () => {
      options = { system_vars: true };
    });

    let $consoleWarn;

    beforeEach('stub `console.warn`', () => {
      $consoleWarn = sinon.stub(console, 'warn');
    });

    afterEach(() => $consoleWarn.restore());

    it('loads system environment variables', () => {
      process.env.SYSTEM_ENV_VAR = 'ok';

      mockFS({
        '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok',
        '/path/to/project/.env.local': 'LOCAL_ENV_VAR=ok'
      });

      const plugin = new DotenvFlow(options);

      expect(plugin.definitions)
        .to.include({
          'process.env.DEFAULT_ENV_VAR': JSON.stringify('ok'),
          'process.env.LOCAL_ENV_VAR': JSON.stringify('ok'),
          'process.env.SYSTEM_ENV_VAR': JSON.stringify('ok')
        });
    });

    it('prioritizes system environment variables', () => {
      process.env.DEFAULT_ENV_VAR = 'predefined by the shell';

      mockFS({
        '/path/to/project/.env': 'DEFAULT_ENV_VAR="defined in `.env`"',
        '/path/to/project/.env.local': 'LOCAL_ENV_VAR="defined in `.env.local`"'
      });

      const plugin = new DotenvFlow(options);

      expect(plugin.definitions)
        .to.include({
          'process.env.DEFAULT_ENV_VAR': JSON.stringify('predefined by the shell'),
          'process.env.LOCAL_ENV_VAR': JSON.stringify('defined in `.env.local`')
        });
    });

    it('warns when a system environment variable overwrites a defined one', () => {
      process.env.DEFAULT_ENV_VAR = 'predefined by the shell';

      mockFS({
        '/path/to/project/.env': 'DEFAULT_ENV_VAR="defined in `.env`"',
        '/path/to/project/.env.local': 'LOCAL_ENV_VAR="defined in `.env.local`"'
      });

      new DotenvFlow(options);

      expect($consoleWarn)
        .to.have.been.calledWith(
          'dotenv-flow-webpack: "%s" is overwritten by the system environment variable with the same name',
          'DEFAULT_ENV_VAR'
        );
    });

    describe('… and `options.silent` is enabled', () => {
      beforeEach(() => {
        options.silent = true;
      })

      it("doesn't print any warnings", () => {
        process.env.DEFAULT_ENV_VAR = 'predefined by the shell';

        mockFS({
          '/path/to/project/.env': 'DEFAULT_ENV_VAR="defined in `.env`"',
          '/path/to/project/.env.local': 'LOCAL_ENV_VAR="defined in `.env.local`"'
        });

        new DotenvFlow(options);

        expect($consoleWarn)
          .to.have.not.been.called;
      });
    });
  });

  describe('if parsing is failed', () => {
    beforeEach("stub `.env*` files' contents", () => {
      mockFS({
        '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok',
        '/path/to/project/.env.local': 'LOCAL_ENV_VAR=ok'
      });
    });

    beforeEach('stub `fs.readFileSync` error', () => {
      $fs_readFileSync
        .withArgs('/path/to/project/.env.local')
        .throws(new Error('`.env.local` file reading error stub'));
    });

    let $consoleError;

    beforeEach('stub `console.error`', () => {
      $consoleError = sinon.stub(console, 'error');
    });

    afterEach(() => $consoleError.restore());

    it('prints the occurred error via `console.error()`', () => {
      new DotenvFlow();

      expect($consoleError)
        .to.have.been.calledWith(
          'dotenv-flow-webpack:',
          '`.env.local` file reading error stub'
        );
    });

    describe('… and `options.silent` is enabled', () => {
      let options;

      beforeEach('setup `options.silent`', () => {
        options = { silent: true };
      });

      it("doesn't print any errors", () => {
        new DotenvFlow(options);

        expect($consoleError)
          .to.have.not.been.called;
      });
    });
  });
});
