# dotenv-flow-webpack

<img src="https://raw.githubusercontent.com/kerimdzhanov/dotenv-flow-webpack/master/dotenv-flow-webpack@2x.png" alt="dotenv-flow-webpack" width="220" height="250" align="right" />

A secure webpack plugin that gives the ability to access environment variables via `process.env.*` defined in your `.env`, `.env.development`, `.env.test`, `.env.production`, etc,. files within your web applications built with webpack.

Storing configuration in _environment variables_ separate from code and grouping them by environments like _development_, _test_ and _production_ is based on [The Twelve-Factor App](https://12factor.net/config) methodology.

> backed by [dotenv-flow](https://github.com/kerimdzhanov/dotenv-flow), inspired by [dotenv-webpack](https://github.com/mrsteele/dotenv-webpack)

[![Build Status](https://github.com/kerimdzhanov/dotenv-flow-webpack/actions/workflows/ci.yml/badge.svg?branch=master&event=push)](https://github.com/kerimdzhanov/dotenv-flow-webpack/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/dotenv-flow-webpack.svg)](https://badge.fury.io/js/dotenv-flow-webpack)
[![Known Vulnerabilities](https://snyk.io/test/github/kerimdzhanov/dotenv-flow-webpack/badge.svg?targetFile=package.json)](https://snyk.io/test/github/kerimdzhanov/dotenv-flow-webpack?targetFile=package.json)

## Installation

Using NPM:

```sh
$ npm install dotenv-flow-webpack --save-dev
```

Using Yarn:

```sh
$ yarn add dotenv-flow-webpack --dev
```


## Description

Technically, the plugin wraps the [`dotenv-flow` API](https://github.com/kerimdzhanov/dotenv-flow#api-reference) providing the ability to configure it in your `webpack.config.js` file(s).

Note that plugin uses a **secure** strategy of replacing of the `process.env.*` code entries upon the build process, thus **it exposes only environment variables that are used in your code**.


## Usage example

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
// webpack.config.js

const DotenvFlow = require('dotenv-flow-webpack');

module.exports = {
  // ...
  plugins: [
    new DotenvFlow()
  ],
  // ...
};
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


## Configuration

As a wrapper of [dotenv-flow](https://github.com/kerimdzhanov/dotenv-flow), **dotenv-flow-webpack** has the same configuration options extending them with its own described below.

##### `options.node_env`
###### Type: `string`
###### Default: `process.env.NODE_ENV`

By default, the plugin refers the `NODE_ENV` environment variable to detect the environment to use.
With the `node_env` option you can force the module to use your custom environment value independent of `process.env.NODE_ENV`.

```js
module.exports = (env, argv) => {
  // ...
  config.plugins.push(new DotenvFlow({
    node_env: env.production ? 'production' : 'development'
  }));
  // ...
};
```

##### `options.default_node_env`
###### Type: `string`
###### Default: _undefined_

If the `NODE_ENV` environment variable is not set, the module doesn't load/parse any `NODE_ENV`-specific files at all.
Therefore, you may want to use `"development"` as the default environment.

```js
new DotenvFlow({
  default_node_env: 'development'
})
```

##### `options.path`
###### Type: `string`
###### Default: `process.cwd()` _(current working directory)_

With the `path` initialization option you can specify a path to `.env*` files directory.

```js
new DotenvFlow({
  path: '/path/to/env-files-dir'
})
```

If the option is not provided, the current working directory will be used.

##### `options.encoding`
###### Type: `string`
###### Default: `'utf8'`

You can specify the encoding of your files containing environment variables.

```js
new DotenvFlow({
  encoding: 'base64'
})
```

##### `options.system_vars`
###### Type: `boolean`
###### Default: `false`

If `true`, all the predefined `process.env.*` variables will also be loaded.
In accordance to the dotenv-flow's specification, all the predefined system environment variables will have higher priority over the `.env*` files defined.

```js
new DotenvFlow({
  system_vars: true
})
```

##### `options.silent`
###### Type: `boolean`
###### Default: `false`

Set to `true` to suppress all errors and warnings.


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

Licensed under [MIT](LICENSE) © 2019-2020 Dan Kerimdzhanov
