# The scala-builder stage compiles Openlaw.scala into JavaScript output,
# via the ScalaJS stuff. There are some other sbt dependencies that also
# get bundled up into the output, including openlaw-core.
FROM openlaw/scala-builder:node as builder
# 1. install plugins and dependencies.
# 
# we do this in two different stages to take advantage of layer caching, with
# the assumption that build deps are more often changed than plugins.
COPY project ./project
RUN sbt update #( installing plugins... )
COPY build.sbt .
RUN sbt update #( installing deps... )
# 2. compile src code to javascript
COPY src src
RUN sbt fullOptJS
# -> creates target/scala-2.12/client.js

# TODO: written explanation of what happens in this stage.
FROM node:10-alpine as packager
WORKDIR /src
COPY package*.json ./
RUN npm ci
COPY --from=builder /src/target/scala-2.12/client.js target/scala-2.12/client.js
COPY js js
COPY *.md *.js .babelrc LICENSE ./
RUN npm run build:prod

# The scripts folder now contains any shell scripts designed to be run inside
# the container itself.
COPY scripts scripts
ENTRYPOINT ["/src/scripts/entrypoint.sh"]
