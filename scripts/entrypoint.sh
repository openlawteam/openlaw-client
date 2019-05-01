#!/bin/sh -l
# This is a simple entrypoint script that runs shell commands relative to the
# container's designated WORKDIR and prevents either it or the HOME variable
# from being overridden.

# Some environments (GitHub Actions) like to override $HOME, which makes sense
# for most actions, but not for us here, since SBT likes to install things in
# dotfile hidden dirs there :(
export HOME=/root

# Change to our preferred workdir, in case we running in an environment that has
# overridden it (e.g. GitHub Actions again, Google Cloud Builder)
cd /src || exit 1

# Now simply run our commands
sh -c "$*"
