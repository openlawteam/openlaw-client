import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import pkg from './package.json';
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default [
  // browser-friendly UMD build
  {
    input: 'js/src/index.js',
    output: {
      name: 'openlaw',
      file: 'dist/umd/openlaw.js',
      format: 'umd'
    },
    plugins: [
      babel({
        exclude: 'node_modules/**',
        // https://github.com/rollup/rollup-plugin-babel#helpers
        runtimeHelpers: true,
      }),
      resolve({
        browser: true,
      }),
      commonjs({
        include: 'node_modules/**'
      }),
      json(),
      replace({
        'process.env.NODE_ENV': '"production"',
      }),
      (
        process.env.BUILD === 'development'
          ? () => {}
          : terser()
      ),
    ],
    moduleContext: {
      'target/scala-2.12/client.js': 'window'
    },
  },

  // esmodule build (for browsers who want to use ESModules)
  //  - This packs everything neatly into 1 file for loading into browsers.
  // * See package scripts for tree-shaking build using Babel and not much else
  {
    input: 'js/src/index.js',
    output: [
      {
        name: 'openlaw',
        file: 'dist/esm/openlaw.esm.js',
        format: 'es',
      }
    ],
    plugins: [
      babel({
        exclude: 'node_modules/**',
        // https://github.com/rollup/rollup-plugin-babel#helpers
        runtimeHelpers: true,
      }),
      resolve({
        browser: true,
      }),
      commonjs(),
      replace({
        'process.env.NODE_ENV': '"production"',
      }),
      (
        process.env.BUILD === 'development'
          ? () => {}
          : terser({ module: true })
      ),
    ],
    moduleContext: {
      'target/scala-2.12/client.js': 'window'
    },
  },

  // CommonJS (for Node) and ES module (for bundlers) build.
  {
    input: 'js/src/index.js',
    output: [
      {
        name: 'openlaw',
        file: pkg.main,
        format: 'cjs',
      },
    ],
    plugins: [
      babel({
        exclude: 'node_modules/**',
        // https://github.com/rollup/rollup-plugin-babel#helpers
        runtimeHelpers: true,
      }),
      resolve({
        browser: true,
      }),
      commonjs({
        include: 'node_modules/**'
      }),
      (
        process.env.BUILD === 'development'
          ? () => {}
          : terser()
      ),
    ],
    moduleContext: {
      'target/scala-2.12/client.js': 'window'
    },
  }
];
