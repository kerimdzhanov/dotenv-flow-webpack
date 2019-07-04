'use strict';

const {DefinePlugin} = require('webpack');
const dotenvFlow = require('dotenv-flow');
const fs = require('fs');

class DotenvFlow extends DefinePlugin {
  /**
   * @param {object} [options] - initialization options
   * @param {string} [options.node_env=process.env.NODE_ENV] - node environment (development/test/production/etc,.)
   * @param {string} [options.default_node_env] - the default node environment
   * @param {string} [options.path=process.cwd()] - path to `.env*` files directory
   * @param {string} [options.encoding='utf8'] - encoding for reading the `.env*` files
   * @param {boolean} [options.system_vars=false] - set to `true` to load all the predefined `process.env.*` variables
   * @param {boolean} [options.silent=false] - set to `true` to suppress all errors and warnings
   */
  constructor(options = {}) {
    let node_env = options.node_env || process.env.NODE_ENV || options.default_node_env;

    if (options.environment) {
      console.warn('dotenv-flow-webpack: the `environment` option is deprecated, please use `node_env` instead'); // >>>
      node_env = options.environment;
    }

    const path = options.path || process.cwd();
    const system_vars = options.system_vars || options.systemvars || false; // allow `options.systemvars` for compatibility with dotenv-webpack's options
    const silent = options.silent || false;

    const _options = {}; // `fs.readFile` options
    if (options.encoding) {
      _options.encoding = options.encoding;
    }

    try {
      const existingFiles = (
        dotenvFlow.listDotenvFiles(path, { node_env })
          .filter(filename => fs.existsSync(filename))
      );

      const variables = dotenvFlow.parse(existingFiles, _options);

      if (system_vars) {
        if (silent) {
          Object.assign(variables, process.env);
        }
        else {
          Object.keys(process.env).forEach((key) => {
            if (variables.hasOwnProperty(key)) {
              console.warn('dotenv-flow-webpack: "%s" is overwritten by the system environment variable with the same name', key); // >>>
            }

            variables[key] = process.env[key];
          });
        }
      }

      const definitions = {};

      Object.keys(variables).forEach((key) => {
        definitions[`process.env.${key}`] = JSON.stringify(variables[key]);
      });

      super(definitions);
    }
    catch (err) {
      silent || console.error('dotenv-flow-webpack:', err.message); // >>>

      super({});
    }
  }
}

module.exports = DotenvFlow;
