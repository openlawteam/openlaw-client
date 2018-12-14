const path = require('path');
const webpack = require('webpack');

const umd = {
  entry: './js/src/index.js',
  output: {
    filename: 'openlaw.js',
    path: path.resolve(__dirname, 'dist/umd'),
    library: 'openlaw',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ]
  },
};

const cjs = {
  entry: './js/src/index.js',
  output: {
    filename: 'openlaw.js',
    path: path.resolve(__dirname, 'dist/cjs'),
    libraryTarget: 'commonjs2',
  },
  target: 'node',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ]
  },
};

module.exports = [umd, cjs];
