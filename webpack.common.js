const path = require('path');

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

const node = {
  entry: './js/src/index.js',
  target: 'node',
  output: {
    filename: 'openlaw.js',
    path: path.resolve(__dirname, 'dist/node'),
    library: 'openlaw',
    libraryTarget: 'commonjs2',
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

module.exports = [umd, node];
