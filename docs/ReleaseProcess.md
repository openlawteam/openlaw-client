https://github.com/openlawteam/openlaw-client

1. Pull latest `master` branch then create new branch off from `master` and make the changes there. _(Note that you **should not** change the `version` number in `package.json` because that will automatically get bumped in the process below.)_

2. On that new branch, if there have been any changes to `package.json` that require a fresh `npm install` then do that first. Otherwise, run `sbt fullOptJS` and then `npm run build_prod` and make sure those complete with no errors. If there are errors, resolve those before continuing.

3. Submit PR for merging that new branch into `master` and then merge it. GitHub Actions will automatically start the build, which you can see here: https://github.com/openlawteam/openlaw-client/actions.

4. Switch to `master` and pull the latest.

5. Run `npm run release` to start the release process.

6. A UI prompt will appear in your console. Click through to select and confirm the `patch` release.

7. You'll see the release steps going through in your console. When that's done the `openlaw-client` repo should open in your browser with a draft release. All you have to do there is click publish (which handles the release and tags in the GitHub repo).

8. Once the release is published, GitHub Actions will automatically start the process to publish the package to NPM. You can monitor the progress for that action again here: https://github.com/openlawteam/openlaw-client/actions.

9. You will see three identical actions of `Publish to NPM on release`. One will eventually successfully publish the package while the other two will fail. Don't worry that is expected right now and it is a TODO to clean that up.

10. You can confirm that the package was successfully published with the latest version number by checking here: https://www.npmjs.com/package/openlaw.
