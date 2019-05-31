import scala.language.postfixOps
import sys.process._

licenses += ("Apache-2.0", url("https://opensource.org/licenses/Apache-2.0"))

lazy val scalaV = "2.12.8"

lazy val repositories = Seq(
  Resolver.jcenterRepo,
  "central" at "http://central.maven.org/maven2/",
  "scalaz-bintray" at "https://dl.bintray.com/scalaz/releases",
  "ethereumj repository" at "http://dl.bintray.com/ethereum/maven",
  "maven central" at "https://mvnrepository.com/repos/central",
  "core bintray repository" at "https://dl.bintray.com/openlawos/openlaw-core",
  Resolver.mavenLocal
)

scalacOptions ++= Seq("-unchecked", "-deprecation", "-feature")
javacOptions ++= Seq("-Xms512M", "-Xmx1024M", "-Xss1M", "-XX:+CMSClassUnloadingEnabled")

lazy val root = (project in file(".")).settings(
  scalaJSLinkerConfig ~= { _.withModuleKind(ModuleKind.ESModule)},
  resolvers ++= repositories,
  organization := "org.openlaw",
  name := "openlaw-core-client",
  scalaVersion := scalaV,
  libraryDependencies ++= Seq(
    "org.openlaw"              %%% "openlaw-core"              % "0.1.32-8-gdc86f82-SNAPSHOT"
  ),
  relativeSourceMaps := true,
  artifactPath in (Compile, fullOptJS) := crossTarget.value / "client.js",
  artifactPath in (Compile, fastOptJS) := crossTarget.value / "client.js",
  npmBuild := {
    (fastOptJS in Compile).value
    "npm run build" !
  },
  npmBuildProd := {
    (fullOptJS in Compile).value
    "npm run build_prod" !
  },
  npmPack := {
    npmBuild.value
    "npm pack" !
  },

  npmPackProd := {
    npmBuildProd.value
    "npm pack" !
  }
).enablePlugins(ScalaJSPlugin)

lazy val npmBuild = taskKey[Unit]("Builds NPM module")
lazy val npmBuildProd = taskKey[Unit]("Builds NPM module for production")
lazy val npmPack = taskKey[Unit]("Packs NPM module")
lazy val npmPackProd = taskKey[Unit]("Packs NPM module for production")
