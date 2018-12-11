/**
 * Webpack entry-point for UMD build
 */

import {Openlaw} from '../../target/scala-2.12/client.js';
import APIClient from './APIClient';

export {Openlaw, APIClient};
