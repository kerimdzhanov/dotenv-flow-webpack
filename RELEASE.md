# Release instructions

## Shipping a new version

1. Make sure all the latest changes are pushed to the repo and all the related
   workflow tests are passing on CI (https://github.com/kerimdzhanov/dotenv-flow-webpack/actions)
2. Bump up the version in `package.json`
3. Update the `CHANGELOG.md` file using `$ yarn changelog`
4. Make a release commit with a message in format `chore(release): vX.Y.Z`
5. Tag the release commit using `$ git tag vX.Y.X`
6. Push the release commit and tag to github `$ git push && git push --tags`
7. Temporary decrease the logo size in `README.md` up to 210x230 (to make it look perfect on npmjs.org)
8. Publish the new package version using `$ yarn publish`
9. Reset the logo size back to original
