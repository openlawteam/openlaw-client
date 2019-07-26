import scala.language.postfixOps

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
    "org.openlaw"              %%% "openlaw-core"              % "0.1.43"
  ),
  relativeSourceMaps := true,
  artifactPath in (Compile, fullOptJS) := crossTarget.value / "client.js",
  artifactPath in (Compile, fastOptJS) := crossTarget.value / "client.js"
).enablePlugins(ScalaJSPlugin)
