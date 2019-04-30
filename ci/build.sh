#!/bin/sh
# Speeds up a "serverless" CI build, by manually storing a copy of the previous
# docker build and pulling it and taking advantage of `--cache-from` directive
# to use it as cache when there is no local cache present.
#
# We use a multi-stage Docker build in this project, so preserving the layer
# caching for a serverless build is a bit more complex. For a reference
# article on the subject, see: https://bit.ly/2KvfD36
#
# In the (hopefully not-so-distant) future, Docker BuildKit should enable easier
# storage of a distributed cache system shared amongst serverless workers
# without this hack.
set -e

# Allow passing a $REMOTE_IMAGE variable if the remote image tag will be
# different (e.g. pushing somewhere other than Docker Hub).
IMAGE="openlaw/client"
REMOTE_IMAGE=${REMOTE_IMAGE:-$IMAGE}

# Default is not to push the cache to remote, to override define PUSH_CACHE=1
# env var. In most cases in CI we will want to be pushing the cache, but since
# it requires docker to be logged in prior, make sure it's an explicit request.
PUSH_CACHE=${PUSH_CACHE:-0}

# Get the current git branch name, this will be used to tag the buildcache such
# that multiple PRs can exist simultaneously without their caches potentially
# colliding.
#
# This will use the $BRANCH environment variable if already set, otherwise will
# fall back to trying to parse git locally. The latter may not work in many CI
# Docker containers (since they don't contain git) so you likely want to make
# sure this is passed in CI based on the particular host's methodology.
BRANCH=${BRANCH:-$(git rev-parse --abbrev-ref HEAD)}

# Define full tags for both current branch and master branch. We want to be 
# able to fall back to the last master branch build in the situation where
# this is the first build for a new branch/PR, so we don't start from scratch
# in that situation.
#
# Allow for an optional ID tag to isolate caches.
ID=${ID:-"ol"}
BUILDER_MASTER_TAG="${REMOTE_IMAGE}:builder-buildcache-${ID}-master"
BUILDER_BRANCH_TAG="${REMOTE_IMAGE}:builder-buildcache-${ID}-${BRANCH}"
PACKAGER_MASTER_TAG="${REMOTE_IMAGE}:packager-buildcache-${ID}-master"
PACKAGER_BRANCH_TAG="${REMOTE_IMAGE}:packager-buildcache-${ID}-${BRANCH}"

# Pull previous cached image(s) from remote docker registry.
docker pull "$BUILDER_MASTER_TAG"  || true
docker pull "$BUILDER_BRANCH_TAG"  || true
docker pull "$PACKAGER_MASTER_TAG" || true
docker pull "$PACKAGER_BRANCH_TAG" || true

##############################################################################
# STAGE 1: Build/cache intermediary builder stage(s).
#
# Normally an intermediary build-stage would not be stored as an image, so we
# do a manual build and set that build-stage as the target.
##############################################################################

docker build ${BUILD_PARAMS:+"$BUILD_PARAMS"} \
    --target=builder \
    --cache-from="$BUILDER_MASTER_TAG" \
    --cache-from="$BUILDER_BRANCH_TAG" \
    -t "${IMAGE}:builder" -t "$BUILDER_BRANCH_TAG" .

if [ "$PUSH_CACHE" -eq "1" ]; then
    docker push "$BUILDER_BRANCH_TAG"
fi

##############################################################################
# STAGE 2: Build/cache final packager stage
##############################################################################

docker build ${BUILD_PARAMS:+"$BUILD_PARAMS"} \
    --cache-from="$BUILDER_MASTER_TAG" \
    --cache-from="$BUILDER_BRANCH_TAG" \
    --cache-from="$PACKAGER_MASTER_TAG" \
    --cache-from="$PACKAGER_BRANCH_TAG" \
    -t "${IMAGE}:packager" -t "$PACKAGER_BRANCH_TAG" .

if [ "$PUSH_CACHE" -eq "1" ]; then
    docker push "$PACKAGER_BRANCH_TAG"
fi
