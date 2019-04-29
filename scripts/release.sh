#!/bin/sh
# Do an automated release to NPM.
#
# Due to some weirdnesses with npm pathes, be sure to call this script from the
# root directory of the project (e.g. via ./scripts/release.sh).
NPM_REGISTRY="registry.npmjs.org"

# Are we logged in to NPM? Check for a *repo-scoped* .npmrc file (e.g. in the
# project directory), if not found, create based on the $NPM_TOKEN variable.
#
# In CI environments where we can mount secrets as files, it may be preferable
# to store and mount the .npmrc directly instead of using env variables.
if [ ! -f .npmrc ]; then
    if [ -z "$NPM_TOKEN" ]; then
        echo "No local .npmrc or NPM_TOKEN environment variable! Exiting..."
        exit 1
    fi
    echo "//${NPM_REGISTRY}/:_authToken=${NPM_TOKEN}" >> .npmrc
fi

# Publish to NPM. Will do a dry-run by default unless overridden via LIVE=1.
#
# The automatically triggered prepublishOnly npm step seems to be very unhappy
# without unsafe-perm as it tries to deescalate its own privileges and can
# no longer modify the working directory.
LIVE=${LIVE:-0}
if [ "$LIVE" -eq "1" ]; then
    # TODO: see if we can detect semver pre-release version strings and
    # automatically append --tag next
    #
    # See: https://medium.com/@mbostock/prereleases-and-npm-e778fc5e2420
    npm publish --unsafe-perm=true
else
    npm publish --unsafe-perm=true --dry-run
fi
