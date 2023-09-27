# [2.0.0-rc.1](https://github.com/kerimdzhanov/dotenv-flow-webpack/compare/v1.2.0...v2.0.0-rc.1) (2023-09-27)


### Features

* **dotenv-flow:** upgrade to dotenv-flow v4 ([#29](https://github.com/kerimdzhanov/dotenv-flow-webpack/issues/29)) ([040c874](https://github.com/kerimdzhanov/dotenv-flow-webpack/commit/040c874))
* **dotenv-flow-webpack:** add `options.pattern` for customizing `.env*` files' naming convention ([#30](https://github.com/kerimdzhanov/dotenv-flow-webpack/issues/30)) ([e2f140f](https://github.com/kerimdzhanov/dotenv-flow-webpack/commit/e2f140f))
* **dotenv-flow-webpack:** add debug messaging ([#31](https://github.com/kerimdzhanov/dotenv-flow-webpack/issues/31)) ([b9b5d9f](https://github.com/kerimdzhanov/dotenv-flow-webpack/commit/b9b5d9f))
* **dotenv-flow-webpack:** throw on failures ([#32](https://github.com/kerimdzhanov/dotenv-flow-webpack/issues/31)) ([242fe6c](https://github.com/kerimdzhanov/dotenv-flow-webpack/commit/242fe6c))
* **dotenv-flow-webpack:** warn if none of the appropriate `.env*` files is found ([#33](https://github.com/kerimdzhanov/dotenv-flow-webpack/issues/33)) ([05428fa](https://github.com/kerimdzhanov/dotenv-flow-webpack/commit/05428fa))

### BREAKING CHANGES

* **dotenv-flow-webpack:** the plugin is now throwing exceptions on `.env*` file reading/parsing failures instead of "error logging" them ([#32](https://github.com/kerimdzhanov/dotenv-flow-webpack/issues/31)) ([242fe6c](https://github.com/kerimdzhanov/dotenv-flow-webpack/commit/242fe6c)).
* **dotenv-flow-webpack:** previously deprecated `options.environment` has been removed, please use `options.node_env` instead ([#27](https://github.com/kerimdzhanov/dotenv-flow-webpack/issues/27)) ([242fe6c](https://github.com/kerimdzhanov/dotenv-flow-webpack/commit/76df0f9)).
* **dotenv-flow:** upgrading to _dotenv-flow_ v4 (and _dotenv_ v16 appropriately) drops Node.js versions support prior to v12.
* **dotenv:** upgrading to _dotenv-flow_ v4 (and _dotenv_ v16 appropriately) adds multiline values, inline comments, and backticks support.
  Please check the contents of your `.env*` files and make sure that
  all the `#` and backtick symbols are properly quoted if they are part of the value.


# [1.2.0](https://github.com/kerimdzhanov/dotenv-flow-webpack/compare/v1.1.0...v1.2.0) (2023-09-22)

* **dotenv-flow:** update dotenv-flow to v3.3.0 ([dc33a8c](https://github.com/kerimdzhanov/dotenv-flow-webpack/commit/dc33a8c))
* **webpack:** support webpack@5 as peer dependency ([#11](https://github.com/kerimdzhanov/dotenv-flow-webpack/issues/11)), closes [#15](https://github.com/kerimdzhanov/dotenv-flow-webpack/issues/15) ([6a35ec5](https://github.com/kerimdzhanov/dotenv-flow-webpack/commit/6a35ec5))



# [1.2.0-rc.1](https://github.com/kerimdzhanov/dotenv-flow-webpack/compare/v1.1.0...v1.2.0-rc.1) (2023-09-16)


### Features

* **dotenv-flow:** update dotenv-flow to v3.3.0 ([dc33a8c](https://github.com/kerimdzhanov/dotenv-flow-webpack/commit/dc33a8c))
* **webpack:** support webpack@5 as peer dependency ([#11](https://github.com/kerimdzhanov/dotenv-flow-webpack/issues/11)), closes [#15](https://github.com/kerimdzhanov/dotenv-flow-webpack/issues/15) ([6a35ec5](https://github.com/kerimdzhanov/dotenv-flow-webpack/commit/6a35ec5))



# [1.1.0](https://github.com/kerimdzhanov/dotenv-flow-webpack/compare/v1.0.0...v1.1.0) (2020-06-27)


### Features

* **dotenv-flow:** update `dotenv-flow` up to `v3.2.0` ([67215cf](https://github.com/kerimdzhanov/dotenv-flow-webpack/commit/67215cf))



# [1.0.0](https://github.com/kerimdzhanov/dotenv-flow-webpack/compare/v1.0.0-rc.2...v1.0.0) (2019-07-05)


# 1.0.0-rc.2 (2019-07-04)


### Bug Fixes

* `JSON.stringify` values ([ab81a87](https://github.com/kerimdzhanov/dotenv-flow-webpack/commit/ab81a87))


### Features

* add warning about the system environment variable overwrite ([ab772f7](https://github.com/kerimdzhanov/dotenv-flow-webpack/commit/ab772f7))


# [1.0.0-rc.1](https://github.com/kerimdzhanov/dotenv-flow-webpack/commit/b633489) (2019-07-04)
