const path = require('path');

/* TODO
 *  - Make babel-polyfill an npm peerDependency as we shouldn't
 *    bundle-up a polyfill in our packaged app, and thus the consumer is required to load it.
 */

module.exports = {
  mode: 'development',
  entry: {
    index: './js/src/index.js',
  },
  output: {
    filename: 'openlaw.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd',
    globalObject: '(typeof window !== \'undefined\' ? window : this)'
  },
  // target: 'node',
  // node: {
  //   process: false
  // },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ]
  }
};
