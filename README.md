# openlaw

[![npm version](https://badge.fury.io/js/openlaw.svg)](https://badge.fury.io/js/openlaw)

**Shared JavaScript libraries for the OpenLaw project**

The OpenLaw JavaScript APIs allow you to integrate and build on the OpenLaw protocol.

The class `APIClient` library is an interface for querying, saving, and changing data in an OpenLaw instance as well as for user authentication. The interface serves as a convenient wrapper to the OpenLaw REST API.

The `Openlaw` object library is an interface to interact directly with an OpenLaw legal agreement and its contents, including its various variable types.

## Documentation

Check out the guide for getting started, the complete reference for using the OpenLaw JavaScript APIs, and other information about how to use the OpenLaw application at our [docs](https://docs.openlaw.io/).

## Installation

```sh
$ npm install openlaw --save
```

## Ways to Use

```js
/**
 * ES2015: import for bundlers like webpack
 */

// import both modules
import { APIClient, Openlaw } from "openlaw";
// OR import only `Openlaw`
import { Openlaw } from "openlaw";
// OR import only `APIClient`
import { APIClient } from "openlaw";


/**
 * CommonJS
 */

// require() for Node.js (or bundlers that support CommonJS-style modules)
const { APIClient, Openlaw } = require('openlaw');


/**
 * Browser: available as a browser global: `openlaw`
 */

<script src="https://unpkg.com/openlaw/dist/umd/openlaw.js"></script>

<script>
  const Openlaw = openlaw.Openlaw;
  const APIClient = openlaw.APIClient;
</script>


/**
 * Browser, with ES Modules (https://caniuse.com/#search=Modules)
 */

// in your app
import { Openlaw, APIClient } from './path/to/openlaw/index.esm.js';

// then, in your HTML
<script type="module" src="./app.js"></script>
```

## Example Usage

### `APIClient`

```js
import { APIClient } from "openlaw";

// Include the root URL for the OpenLaw instance.
apiClient = new APIClient('https://app.openlaw.io');

/*
Most of the APIClient method calls can only be made by a logged in
user with a StandardUser role or an Admin role. Log in before making
those calls.
*/
apiClient.login('openlawuser+1@gmail.com', 'password');

apiClient.getTemplate('Advisor Agreement').then(result => {
  console.log(result);
});
/*
{
  "id": "d76ede8ca437f6da06b1e09f115393318faf29fdc5bdaaf0b2e889886136edf4",
  "title": "Advisor Agreement",
  "content": "This Advisor Agreement is entered into between [[Company Name: Text]] (\"Corporation\") and [[Advisor Name]] (\"Advisor\") as of [[Effective Date: Date]] (\"Effective Date\"). Company and Advisor agree as follows:  \n\n^ **Services**. Advisor agrees to consult with and advise Company from time to time, at Company's request (the \"Services\"). {{No Services \"Do you want to limit the advisor's services?\"  While this Agreement is is effect, Advisor will not provide services to any company active in the field of [[Noncompete Field \"What field should the advisor not participate in?\"]].}}\n\n...**COMPANY:**\n[[Company Signatory Email: Identity]]\n\n___________________\nName:  [[Company Signatory]]\nAddress:  [[Company Address: Address]]\n\n\n**ADVISOR:**\n[[Advisor Email: Identity]]\n\n___________________\nName [[Advisor Name]]      \nAddress: [[Advisor Address: Address]]\n",
  "templateType": "agreement"
}
*/
```

### `Openlaw`

```js
import { Openlaw } from "openlaw";

const compiledTemplate = Openlaw.compileTemplate(
  'This Advisor Agreement is entered into between [[Company Name]] ("Corporation") and [[Advisor Name]] ("Advisor") as of [[Effective Date: Date]] ("Effective Date"). Company and Advisor agree as follows: \n\n^**Services**. Advisor agrees to consult with and advise Company from time to time, at Company\'s request (the "Services").'
);

console.log(compiledTemplate);
/*
{
  isError: false,
  errorMessage: "",
  compiledTemplate: CompiledTemplate
}
*/
```

## Troubleshooting

_(Project maintainers only)_

Before the first time you run `npm run build` or `npm run build_prod`, run `sbt fullOptJS` from the project root directory to generate the `client.js` file. Otherwise, you will see an error like the following:

```
ERROR in Entry module not found: Error: Can't resolve '/$YOUR_DIR/openlaw-client/target/scala-2.12/client.js' in '/$YOUR_DIR/openlaw-client'.
```

## Publishing Releases

_(Project maintainers only)_

Run `npm run release` which will walk you through the process of updating the
semantic version, and drafting a GitHub release. Once the release is published
on GitHub, the CI/CD should detect it and handle the publication to NPM.

There is also `release:patch` shortcut for semver patch changes.

## Contributing 

See information about contributing [here](docs/CONTRIBUTING.md).

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
