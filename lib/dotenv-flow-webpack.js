'use strict';

const {DefinePlugin} = require('webpack');
const {DEFAULT_PATTERN, listFiles, parse} = require('dotenv-flow');

class DotenvFlow extends DefinePlugin {
  /**
   * @param {object} [options] - initialization options
   * @param {string} [options.node_env=process.env.NODE_ENV] - node environment (development/test/production/etc,.)
   * @param {string} [options.default_node_env] - the default node environment
   * @param {string} [options.path=process.cwd()] - path to `.env*` files directory
   * @param {string} [options.pattern='.env[.node_env][.local]'] - naming
   * @param {BufferEncoding|null} [options.encoding='utf8'] - encoding for reading the `.env*` files
   * @param {boolean} [options.system_vars=false] - set to `true` to load all the predefined `process.env.*` variables
   * @param {boolean} [options.silent=false] - set to `true` to suppress all errors and warnings
   */
  constructor(options = {}) {
    const node_env = options.node_env || process.env.NODE_ENV || options.default_node_env;

    const {
      path = process.cwd(),
      pattern = DEFAULT_PATTERN,
      system_vars = options.systemvars || false // allow `options.systemvars` for compatibility with dotenv-webpack's options
    } = options;

    try {
      const filenames = listFiles({ node_env, path, pattern });
      const variables = parse(filenames, { encoding: options.encoding });

      if (system_vars) {
        Object.keys(process.env).forEach((varname) => {
          if (!options.silent && variables.hasOwnProperty(varname)) {
            console.warn(
              'dotenv-flow-webpack: "%s" is overwritten by the system environment variable with the same name',
              varname
            ); // >>>
          }

          variables[varname] = process.env[varname];
        });
      }

      const definitions = {};

      Object.keys(variables).forEach((varname) => {
        definitions[`process.env.${varname}`] = JSON.stringify(variables[varname]);
      });

      super(definitions);
    }
    catch (err) {
      options.silent || console.error('dotenv-flow-webpack:', err.message); // >>>

      super({});
    }
  }
}

module.exports = DotenvFlow;
