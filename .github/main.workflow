workflow "Build and lint on push" {
  on = "push"
  resolves = ["Caching Build", "LintersOK"]
}

action "Docker Registry Login" {
  uses = "actions/docker/login@master"
  secrets = ["DOCKER_USERNAME", "DOCKER_PASSWORD"]
}

action "Caching Build" {
  uses = "actions/docker/cli@master"
  runs = ["sh", "-c", "BRANCH=gh-${GITHUB_REF##*/} ci/build.sh"]
  needs = ["Docker Registry Login"]
  env = {
    PUSH_CACHE = "1"
  }
}

action "Shellcheck Lint" {
  uses = "actions/bin/shellcheck@master"
  args = ["scripts/*.sh", "ci/*.sh"]
}

action "LintersOK" {
  uses = "actions/bin/sh@master"
  needs = ["Shellcheck Lint"]
  args = ["echo linters OK"]
}



workflow "Publish to NPM on release" {
  on = "release"
  resolves = ["Publish", "Debug Event"]
}

# filter for "published" action
action "Published action only" {
  uses = "actions/bin/filter@master"
  args = "action 'published'"
}

action "Publish" {
  uses = "docker://openlaw/client:packager"
  runs = "./scripts/release.sh"
  secrets = ["NPM_TOKEN"]
  env = {
    LIVE = "1"
  }
  needs = ["Published action only", "Caching Build"]
}

action "Debug Event" {
  uses = "actions/bin/sh@master"
  runs = ["sh", "-c", "cat $GITHUB_EVENT_PATH"]
}
