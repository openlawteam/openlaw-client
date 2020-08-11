import scala.language.postfixOps

licenses += ("Apache-2.0", url("https://opensource.org/licenses/Apache-2.0"))

/*
The Scala and SBT versions must be matched to the version of scala-builder used
as the base image of the container. We try to standardize across projects and
always upgrade in a controlled fashion.

If you wish to update either Scala or SBT, please open an issue and and tag
@openlawteam/infra.
 */
lazy val scalaV = "2.12.10"

lazy val repositories = Seq(
  Resolver.jcenterRepo,
  "central" at "https://repo1.maven.org/maven2/",
  "scalaz-bintray" at "https://dl.bintray.com/scalaz/releases",
  "ethereumj repository" at "http://dl.bintray.com/ethereum/maven",
  "maven central" at "https://mvnrepository.com/repos/central",
  "core bintray repository" at "https://dl.bintray.com/openlawos/openlaw-core",
  Resolver.mavenLocal
)

scalacOptions ++= Seq("-unchecked", "-deprecation", "-feature")
javacOptions ++= Seq(
  "-Xms512M",
  "-Xmx1024M",
  "-Xss1M",
  "-XX:+CMSClassUnloadingEnabled"
)

lazy val root = (project in file("."))
  .settings(
    scalaJSLinkerConfig ~= {
      _.withModuleKind(ModuleKind.ESModule)
        .withESFeatures(_.withUseECMAScript2015(true))
    },
    resolvers ++= repositories,
    organization := "org.openlaw",
    name := "openlaw-core-client",
    scalaVersion := scalaV,
    libraryDependencies ++= Seq(
      "org.openlaw" %%% "openlaw-core" % "0.1.84"
    ),
    relativeSourceMaps := true,
    artifactPath in (Compile, fullOptJS) := crossTarget.value / "client.js",
    artifactPath in (Compile, fastOptJS) := crossTarget.value / "client.js"
  )
  .enablePlugins(ScalaJSPlugin)
