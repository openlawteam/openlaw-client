# Release Process: openlaw-client

## Submitting Changes :sparkles:

New code changes should always be introduced via a Pull Request branch:

1. Pull latest `master` branch then create new branch off from `master` and make the changes there. _(Note that you **should not** change the `version` number in `package.json` because that is automatically managed via the release process below.)_

2. On that new branch, if there have been any changes to `package.json` that require a fresh `npm install` (e.g. updating a dependency version) then do that first. When you run `npm install` it should update the `package-lock.json` file -- make sure those updates are committed to the code as well.

3. Otherwise, run `sbt fullOptJS` and then `npm run build_prod` and make sure those complete with no errors. If there are errors, resolve those before continuing.

4. Ensure your Javascript code passes lints and adheres to our style guide. If you are not running a plugin in your editor that does this for you automatically, you can run `npm run lint:fix` and `npm run style:fix` respectively to automatically resolve any issues.

5. Submit PR for merging that new branch into `master`. GitHub Actions will automatically attempt a build and run linter checks, which you can see here: https://github.com/openlawteam/openlaw-client/actions. If the build and all checks are passing, the PR can be merged to master.

## Releasing to NPM :rocket:

New releases are always cut from the `master` branch, and managed via GitHub Releases with [Semantic Versioning](https://semver.org/spec/v2.0.0.html) formatted tags. As a developer, this process is largely automated for you. To make a release of the current status of master, follow these steps:

1. Switch to `master` and pull the latest.

2. Run `npm run release` to start the release process.

3. A prompt will appear in your console allowing you to pick what sort of Semantic Version increment to pick. In most cases, you will be selecting a `patch` release. _(Note: you can skip the interactive prompt for a patch by substituting `npm run release:patch` in the step above.)_

4. You'll see the release steps going through in your console.<sup>§</sup> When that's done the `openlaw-client` repo should open in your web browser with a draft release. All you have to do there is verify the release notes and click publish.

   <small><i>§: Behind the scenes, the `package*.json` files will be updated with the new version, a new git commit and tag will be made and pushed to GitHub, and your web browser will be automatically opened to a draft release page for making a "release" of that tag.</i></small>

5. Once a GitHub Release is published, our CI system (currently GitHub Actions) will automatically start the process to publish the package to NPM. You can monitor the progress for that action again here: https://github.com/openlawteam/openlaw-client/actions.

6. You will see three identical actions of `Publish to NPM on release`. One will eventually successfully publish the package while the other two will fail. Don't worry that is expected right now and it is a TODO to clean that up.

7. Confirm that the package was successfully published with the latest version number by checking the NPM listing: https://www.npmjs.com/package/openlaw.
