'use strict';

const {DefinePlugin} = require('webpack');
const {DEFAULT_PATTERN, listFiles, parse} = require('dotenv-flow');
const {version} = require('../package.json');

/**
 * Returns effective (computed) `node_env`.
 *
 * @param {object} options
 * @param {string} [options.node_env]
 * @param {string} [options.default_node_env]
 * @param {boolean} [options.debug]
 * @return {string|undefined} node_env
 */
function getEffectiveNodeEnv(options) {
  if (options.node_env) {
    options.debug && debug(
      `building for "${options.node_env}" environment (set by \`options.node_env\`)`
    );
    return options.node_env;
  }

  if (process.env.NODE_ENV) {
    options.debug && debug(
      `building for "${process.env.NODE_ENV}" environment (as per \`process.env.NODE_ENV\`)`
    );
    return process.env.NODE_ENV;
  }

  if (options.default_node_env) {
    options.debug && debug(
      `building for "${options.default_node_env}" environment (taken from \`options.default_node_env\`)`
    );
    return options.default_node_env;
  }

  options.debug && debug(
    'building in "no environment" mode (no environment-related options are set)'
  );

  return undefined;
}

const CONFIG_OPTION_KEYS = [
  'node_env',
  'default_node_env',
  'path',
  'pattern',
  'encoding',
  'system_vars',
  'systemvars',
  'silent'
];

class DotenvFlow extends DefinePlugin {
  /**
   * @param {object} [options] - initialization options
   * @param {string} [options.node_env=process.env.NODE_ENV] - node environment (development/test/production/etc,.)
   * @param {string} [options.default_node_env] - the default node environment
   * @param {string} [options.path=process.cwd()] - path to `.env*` files directory
   * @param {string} [options.pattern='.env[.node_env][.local]'] - naming
   * @param {BufferEncoding|null} [options.encoding='utf8'] - encoding for reading the `.env*` files
   * @param {boolean} [options.system_vars=false] - set to `true` to load all the predefined `process.env.*` variables
   * @param {boolean} [options.debug=false] - turn on detailed logging to help debug why certain variables are not being set as you expect
   * @param {boolean} [options.silent=false] - suppress all kinds of warnings including ".env*" files' loading errors
   */
  constructor(options = {}) {
    if (options.debug) {
      debug('initializing…');

      CONFIG_OPTION_KEYS
        .filter(key => key in options)
        .forEach(key => debug(`| options.${key} =`, options[key]));
    }

    const node_env = getEffectiveNodeEnv(options);

    const {
      path = process.cwd(),
      pattern = DEFAULT_PATTERN,
      system_vars = options.systemvars || false // allow `options.systemvars` for compatibility with dotenv-webpack's options
    } = options;

    const filenames = listFiles({ node_env, path, pattern, debug: options.debug });
    const variables = parse(filenames, { encoding: options.encoding, debug: options.debug });

    if (system_vars) {
      options.debug && debug('registering system environment variables…');

      for (const varname of Object.keys(process.env)) {
        if (options.debug && variables.hasOwnProperty(varname)) {
          debug(
            '`process.env.%s` is overwritten by system-defined environment variable `%s`',
            varname,
            varname
          );
        }

        variables[varname] = process.env[varname];
      }
    }

    const definitions = {};

    options.debug && debug("registering environment variables' definitions…");

    for (const varname of Object.keys(variables)) {
      options.debug && debug('>> process.env.%s', varname);
      definitions[`process.env.${varname}`] = JSON.stringify(variables[varname]);
    }

    super(definitions);

    options.debug && debug('initialization completed.');
  }
}

function debug(message, ...values) {
  console.debug(`[dotenv-flow-webpack@${version}]: ${message}`, ...values);
}

module.exports = DotenvFlow;
