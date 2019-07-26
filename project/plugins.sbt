logLevel := Level.Warn

resolvers += "Typesafe repository" at "http://repo.typesafe.com/typesafe/releases/"
resolvers += "Typesafe Repository" at "https://repo.typesafe.com/typesafe/releases/"
resolvers += Resolver.url("sbt-plugins", url("https://dl.bintray.com/ssidorenko/sbt-plugins/"))(Resolver.ivyStylePatterns)

addSbtPlugin("org.scala-js" % "sbt-scalajs" % "0.6.28")
addSbtPlugin("org.lyranthe.sbt" % "partial-unification" % "1.1.0")

/* WartRemover currently chokes on ScalaJS and causes lots of false positives.
In the future, we can re-enable here if resikved and then enable it in our build
settings. */ 
// addSbtPlugin("org.wartremover" % "sbt-wartremover" % "2.4.1")

/* Informational tools you may wish to install locally:
"sbt-dependency-graph is an informational tool rather than one that changes
your build, so you will more than likely wish to install it as a global plugin
so that you can use it in any SBT project without the need to explicitly add it
to each one. To do this, add the plugin dependency to 
~/.sbt/1.0/plugins/plugins.sbt for sbt 1.0"

Same logic appears to apply to sbt-updates and sbt-dependency check. */
// addSbtPlugin("net.virtual-void" % "sbt-dependency-graph" % "0.9.0")
// addSbtPlugin("com.timushev.sbt" % "sbt-updates" % "0.3.4")
// addSbtPlugin("net.vonbuchholtz" % "sbt-dependency-check" % "0.2.6")
