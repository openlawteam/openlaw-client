workflow "Build on push" {
  on = "push"
  resolves = ["Caching Build"]
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

workflow "Linters on push" {
  on = "push"
  resolves = ["LintersOK"]
}

action "Shellcheck Lint" {
  uses = "actions/bin/shellcheck@master"
  args = ["scripts/*.sh", "ci/*.sh"]
  needs = ["NPM CI"]
}

action "NPM CI" {
  uses = "actions/npm@master"
  args = "ci"
}

action "Prettier Lint" {
  uses = "actions/npm@master"
  args = ["run", "style"]
  needs = ["NPM CI"]
}

action "ESLint" {
  uses = "actions/npm@master"
  args = ["run", "lint"]
  needs = ["NPM CI"]
}

action "LintersOK" {
  uses = "actions/bin/sh@master"
  needs = [
    "Shellcheck Lint",
    "Prettier Lint",
    "ESLint",
  ]
  args = ["echo all linters OK"]
}

workflow "Publish to NPM on release" {
  on = "release"
  resolves = ["Publish", "Debug Event"]
}

action "Publish" {
  uses = "docker://openlaw/client:packager"
  runs = "./scripts/release.sh"
  secrets = ["NPM_TOKEN"]
  env = {
    LIVE = "1"
  }
  needs = ["Caching Build"]
}

action "Debug Event" {
  uses = "actions/bin/sh@master"
  runs = ["sh", "-c", "cat $GITHUB_EVENT_PATH"]
}
