import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import pkg from './package.json';
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default [
  // browser-friendly UMD (window.openlaw, iife, commonJS, AMD)
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
        runtimeHelpers: true
      }),
      resolve({
        browser: true
      }),
      commonjs({
        include: 'node_modules/**'
      }),
      json(),
      replace({
        'process.env.NODE_ENV': '"production"'
      }),
      process.env.BUILD === 'development' ? undefined : terser()
    ],
    moduleContext: {
      'target/scala-2.12/client.js': 'window'
    }
  },

  // index.esm.js: ESModule bundled single file
  //   - Combines all exported files into a single bundle
  {
    input: 'js/src/index.js',
    output: [
      {
        file: 'dist/esm/index.esm.js',
        format: 'es'
      }
    ],
    plugins: [
      babel({
        exclude: 'node_modules/**',
        // https://github.com/rollup/rollup-plugin-babel#helpers
        runtimeHelpers: true
      }),
      resolve({
        browser: true
      }),
      commonjs(),
      replace({
        'process.env.NODE_ENV': '"production"'
      }),
      process.env.BUILD === 'development' ? undefined : terser({ module: true })
    ],
    moduleContext: {
      'target/scala-2.12/client.js': 'window'
    }
  },

  // apiclient.esm.js: ESModule bundled single file
  //   - Allows browser ESModule users to only pick this file
  {
    input: 'js/src/APIClient.js',
    output: [
      {
        file: 'dist/esm/apiclient.esm.js',
        format: 'es'
      }
    ],
    plugins: [
      babel({
        exclude: 'node_modules/**',
        // https://github.com/rollup/rollup-plugin-babel#helpers
        runtimeHelpers: true
      }),
      resolve({
        browser: true
      }),
      commonjs(),
      replace({
        'process.env.NODE_ENV': '"production"'
      }),
      process.env.BUILD === 'development' ? undefined : terser({ module: true })
    ]
  },

  // openlaw.esm.js: ESModule bundled single file
  //   - Allows browser ESModule users to only pick this file
  {
    input: 'target/scala-2.12/client.js',
    output: [
      {
        file: 'dist/esm/openlaw.esm.js',
        format: 'es'
      }
    ],
    plugins: [
      process.env.BUILD === 'development' ? undefined : terser({ module: true })
    ],
    moduleContext: {
      'target/scala-2.12/client.js': 'window'
    }
  },

  // CommonJS (node, also works in Webpack for web)
  {
    input: 'js/src/index.js',
    output: [
      {
        file: pkg.main,
        format: 'cjs'
      }
    ],
    external: [
      '@babel/runtime/regenerator',
      '@babel/runtime/helpers/asyncToGenerator',
      '@babel/runtime/helpers/classCallCheck',
      '@babel/runtime/helpers/createClass',
      '@babel/runtime/helpers/defineProperty',
      'axios',
      'query-string'
    ],
    plugins: [
      babel({
        exclude: 'node_modules/**',
        // https://github.com/rollup/rollup-plugin-babel#helpers
        runtimeHelpers: true
      }),
      process.env.BUILD === 'development' ? undefined : terser()
    ],
    moduleContext: {
      'target/scala-2.12/client.js': 'this'
    }
  }
];
