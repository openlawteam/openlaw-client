logLevel := Level.Warn

resolvers += "Typesafe repository" at "http://repo.typesafe.com/typesafe/releases/"
resolvers += "Typesafe Repository" at "https://repo.typesafe.com/typesafe/releases/"
resolvers += Resolver.url("sbt-plugins", url("https://dl.bintray.com/ssidorenko/sbt-plugins/"))(Resolver.ivyStylePatterns)

addSbtPlugin("org.scala-js" % "sbt-scalajs" % "0.6.26")

/* sbt-dependency-graph is an informational tool rather than one that changes
your build, so you will more than likely wish to install it as a global plugin
so that you can use it in any SBT project without the need to explicitly add it
to each one. To do this, add the plugin dependency to
~/.sbt/0.13/plugins/plugins.sbt for sbt 0.13 or ~/.sbt/1.0/plugins/plugins.sbt
for sbt 1.0 */
// addSbtPlugin("net.virtual-void" % "sbt-dependency-graph" % "0.9.0")

/* Unused packaged for releasing to bintray */
// addSbtPlugin("org.foundweekends" % "sbt-bintray" % "0.5.4")
// addSbtPlugin("com.github.gseitz" % "sbt-release" % "1.0.7")

addSbtPlugin("org.lyranthe.sbt" % "partial-unification" % "1.1.0")
addSbtPlugin("com.timushev.sbt" % "sbt-updates" % "0.3.4")

/*
The sbt-dependency-check plugin allows projects to monitor dependent
libraries for known, published vulnerabilities (e.g. CVEs).

TODO: Are we currently running this for this repo? I believe the only dependency
on this repo is scala-js and openlaw-core itself?
*/
addSbtPlugin("net.vonbuchholtz" % "sbt-dependency-check" % "0.2.6")

/* We are not actively using ScalaStyle linting at the moment. */
// addSbtPlugin("org.scalastyle" %% "scalastyle-sbt-plugin" % "1.0.0")

/* WartRemover does not seem to used in this project. We can re-enable here if
we want to enable it in our build settings. */
// addSbtPlugin("org.wartremover" % "sbt-wartremover" % "2.4.1")

/*
This is probably used during local development? But causes problems if
just want to do a build... since it bombs entirely without .git
TODO: ask the scala devs and rationalize
*/
// addSbtPlugin("com.thoughtworks.sbt-scala-js-map" % "sbt-scala-js-map" % "3.0.0")
