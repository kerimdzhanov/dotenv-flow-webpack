# dotenv-flow-webpack

<img src="https://raw.githubusercontent.com/kerimdzhanov/dotenv-flow-webpack/master/dotenv-flow-webpack@2x.png" alt="dotenv-flow-webpack" width="220" height="250" align="right" />

A Webpack plugin that allows you to securely use environment variables within your javascript web application, loading them using _[dotenv-flow](https://github.com/kerimdzhanov/dotenv-flow)'s_ `.env*` files loading strategy.

> _dotenv-flow_ extends _[dotenv](https://github.com/motdotla/dotenv)_, adding support of `NODE_ENV`-specific `.env*` files _like `.env.development`, `.env.test`, `.env.stage`, and `.env.production`,_ and the appropriate `.env*.local` overrides allowing your app to have multiple environments with selectively-adjusted environment variable setups and load them dynamically depending on the current NODE_ENV.

🌱 Inspired by _[dotenv-webpack](https://github.com/mrsteele/dotenv-webpack)_, _[CreateReactApp](https://create-react-app.dev/)'s **storing configs in `.env*` files** approach_,
the _Twelve-Factor App methodology_ in general, and _its **[store config in the environment](https://12factor.net/config)** section_ in particular.

[![Build Status](https://github.com/kerimdzhanov/dotenv-flow-webpack/actions/workflows/ci.yml/badge.svg?branch=master&event=push)](https://github.com/kerimdzhanov/dotenv-flow-webpack/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/dotenv-flow-webpack.svg)](https://badge.fury.io/js/dotenv-flow-webpack)
[![Known Vulnerabilities](https://snyk.io/test/github/kerimdzhanov/dotenv-flow-webpack/badge.svg?targetFile=package.json)](https://snyk.io/test/github/kerimdzhanov/dotenv-flow-webpack?targetFile=package.json)


## Key Features

- **Environment-based configuration**: You can have different `.env*` files for various environments like _development_, _test_, and _production_.
- **Variable overriding** _(or environment-specific cascade)_: Allows you to selectively override the default and environment-specific variables with the appropriate `.env*.local` overrides.
- **Secure**: Injects variables by replacing the `process.env.<YOUR_VAR>` entries with the actual values from your `.env*` files during the build process, thus _**exposing only those variables that are explicitly used in your code**_.
- **[dotenv-flow](https://github.com/kerimdzhanov/dotenv-flow) as a Webpack plugin**: directly integrates dotenv-flow with all its flexibility options to your build process making it easier to use environment variables without extra build scripts.


## Installation

Using NPM:

```sh
$ npm install dotenv-flow-webpack --save-dev
```

Using Yarn:

```sh
$ yarn add dotenv-flow-webpack --dev
```


## Basic usage

Here's how to include the **dotenv-flow-webpack** to your `webpack.config.js`:

```js
// webpack.config.js

const DotenvFlow = require('dotenv-flow-webpack');

module.exports = {
  // ...other webpack configurations
  plugins: [
    new DotenvFlow({
      // configuration options
    })
  ],
  // ...other webpack plugins
};
```

## Configuration options

#### `node_env`
###### Type: `string`
###### Default: `process.env.NODE_ENV || options.default_node_env`

By default, the plugin refers the `NODE_ENV` environment variable to detect the environment to use.
With the `node_env` option you can force the module to use your custom environment value independent of `process.env.NODE_ENV`.

```js
new DotenvFlow({
  node_env: 'production'
})
```

#### `default_node_env`
###### Type: `string`
###### Default: _undefined_

If the `NODE_ENV` environment variable is not set, the module doesn't load/parse any `NODE_ENV`-specific files at all.
Therefore, you may want to use `"development"` as the default environment.

```js
new DotenvFlow({
  default_node_env: 'development'
})
```

#### `path`
###### Type: `string`
###### Default: `process.cwd()` _(current working directory)_

With the `path` initialization option you can specify a path to `.env*` files directory.

```js
new DotenvFlow({
  path: './config'
})
```

If the option is not provided, the current working directory is used.

#### `pattern`
###### Type: `string`
###### Default: `'.env[.node_env][.local]'`

Allows you to change the default `.env*` files' naming convention
if you want to have a specific file naming structure for maintaining
your environment variables' files.

**Default Value**

The default value `".env[.node_env][.local]"` makes *dotenv-flow-webpack*
look up and load the following files in order:

1. `.env`
2. `.env.local`
3. `.env.${NODE_ENV}`
4. `.env.${NODE_ENV}.local`

For example, when the `proess.env.NODE_ENV` (or `options.node_env`) is set to `"development"`,
*dotenv-flow-webpack* will be looking for and parsing (if found) the following files:

1. `.env`
2. `.env.local`
3. `.env.development`
4. `.env.development.local`

**Custom Pattern**

Here is a couple of examples of customizing the `.env*` files naming convention:

For example, if you set the pattern to `".env/[local/]env[.node_env]"`,
*dotenv-flow-webpack* will look for these files instead:

1. `.env/env`
2. `.env/local/env`
3. `.env/env.development`
4. `.env/local/env.development`

… or if you set the pattern to `".env/[.node_env/].env[.node_env][.local]"`,
the plugin will try to find and parse:

1. `.env/.env`
2. `.env/.env.local`
3. `.env/development/.env.development`
4. `.env/development/.env.development.local`

› Please refer to [`dotenv-flow.listFiles(options)`](https://github.com/kerimdzhanov/dotenv-flow#listfilesoptions--string) to learn more.

#### `encoding`
###### Type: `string`
###### Default: `'utf8'`

You can specify the encoding of your files containing environment variables.

```js
new DotenvFlow({
  encoding: 'base64'
})
```

#### `system_vars`
###### Type: `boolean`
###### Default: `false`

If `true`, all the predefined `process.env.*` variables will also be loaded.
In accordance to the dotenv-flow's specification, all the predefined system environment variables will have higher priority over the `.env*` files defined.

```js
new DotenvFlow({
  system_vars: true
})
```

#### `options.debug`
###### Type: `boolean`
###### Default: `false`

Enables detailed logging to debug why certain variables are not being set as you expect.

```js
new DotenvFlow({
  debug: true
})
```

#### `silent`
###### Type: `boolean`
###### Default: `false`

Set to `true` to suppress all kinds of errors and warnings.

```js
new DotenvFlow({
  silent: true
})
```

## Project Example

Let's suppose you have the following files in your project:

```sh
# .env

DATABASE_HOST=127.0.0.1
DATABASE_PORT=27017
DATABASE_USER=default
DATABASE_PASS=
DATABASE_NAME=my_app

SERVICE_URL=/api/v1
```

```sh
# .env.development

DATABASE_NAME=my_app_dev

SERVICE_URL=http://localhost:3000/api/v1
```

```sh
# .env.test

SERVICE_URL=https://localhost:3001/api/v1
```

```sh
# .env.production

DATABASE_HOST=10.0.0.32
DATABASE_PORT=27017
DATABASE_USER=devops
DATABASE_PASS=1qa2ws3ed4rf5tg6yh
DATABASE_NAME=application_storage

SERVICE_URL=https://myapp.com/api/v1
```

```js
// file1.js

if (process.env.NODE_ENV !== 'production') {
  console.log(`Running in the "${process.env.NODE_ENV}" mode.`);
}
else {
  console.log('We are in production!');
}

const USERS_ENDPOINT = process.env.SERVICE_URL + '/users';

console.log('USERS_ENDPOINT:', USERS_ENDPOINT);
```

Thus, when you build your app with `NODE_ENV=development`, the resulting bundle will include something like this:

```js
// file1.js

if (true) {
  console.log("Running in the ".concat("development", " mode."));
} else {}

const USERS_ENDPOINT = "http://localhost:3000/api/v1" + '/users';

console.log('USERS_ENDPOINT:', USERS_ENDPOINT);
```

Or if you build your app with `NODE_ENV=production`, then the output will look like:

```js
// file1.js

if (false) {} else {
  console.log('We are in production!');
}

const USERS_ENDPOINT = "https://myapp.com/api/v1" + '/users';

console.log('USERS_ENDPOINT:', USERS_ENDPOINT);
```

And after all the optimization procedures it will be compressed till:

```js
console.log("We are in production!");
console.log("USERS_ENDPOINT:", "https://myapp.com/api/v1/users");
```

Make a note that values of `DATABASE_(HOST/PORT/USER/PASSWORD/NAME)` will **not** be present in the resulting bundle while they are not referenced anywhere in the code.


## Additional information

Please refer the [dotenv-flow documentation](https://github.com/kerimdzhanov/dotenv-flow#readme) to learn more about the `.env*` files concept.

Here is the list of related sections:

 * [`NODE_ENV`-specific `.env*` files](https://github.com/kerimdzhanov/dotenv-flow#node_env-specific-env-files)
 * [Files under version control](https://github.com/kerimdzhanov/dotenv-flow#files-under-version-control)
 * [Variables overwriting/priority](https://github.com/kerimdzhanov/dotenv-flow#variables-overwritingpriority)


## Contributing

Feel free to dive in! [Open an issue](https://github.com/kerimdzhanov/dotenv-flow-webpack/issues/new) or submit PRs.


## Running tests

Using NPM:

```sh
$ npm test
```

Using Yarn:

```sh
$ yarn test
```


## License

Licensed under [MIT](LICENSE) © 2019-2023 Dan Kerimdzhanov
