/**
 * Webpack entry-point for esm, cjs and umd builds
 */

import {Openlaw} from '../../target/scala-2.12/client.js';
import APIClient from './APIClient';

export {Openlaw, APIClient};
