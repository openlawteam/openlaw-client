# Shared JavaScript libraries for the OpenLaw project

## Getting started

If you want to learn more about our libraries, please read our [OpenLaw core overview](https://docs.openlaw.io/openlaw-core/), which describes the Scala portion of the code.

To use OpenLaw core and our APIClient library in your JavaScript project, you can use our npm package with `npm install openlaw --save`. You can find further instructions for how to use the library [here](npm.README.md) and in our [docs](https://docs.openlaw.io).

## Troubleshooting 

Before the first time you run `npm run build` or `npm run build_prod`, run `sbt fullOptJS` from the project root directory to generate the `client.js` file. Otherwise, you will see an error like the following:

```
ERROR in Entry module not found: Error: Can't resolve '/$YOUR_DIR/openlaw-client/target/scala-2.12/client.js' in '/$YOUR_DIR/openlaw-client'.
```

## Contributing 

See information about contributing [here](CONTRIBUTING.md).

## License

Copyright 2019 Aaron Wright, David Roon, and ConsenSys AG.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
