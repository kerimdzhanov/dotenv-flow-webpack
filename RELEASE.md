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
8. Publish the new package version using `$ yarn publish [--tag=next]`
9. Reset the logo size back to original
10. Create a new version release On GitHub
11. When releasing a stable (`@latest`) version, remove the `@next` tag from
    the current release candidate using `$ yarn tag rm dotenv-flow-webpack next`
