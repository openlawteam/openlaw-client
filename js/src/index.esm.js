/**
 * This file will be copied into `dist/esm` on build:esm.
 * It is so that consumer apps who are compatible with ES6 modules can:
 *   1. Easily pull the es module files in
 *   2. Tree-shake unneeded (dead) code (e.g. An app only wants to use the
 *      `APIClient` b/c `Openlaw` is already on their server)
 */

import {Openlaw} from './openlaw.js';
import APIClient from './APIClient';

export {Openlaw, APIClient};
