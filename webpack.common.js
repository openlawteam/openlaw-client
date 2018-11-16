const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    // babel-polyfill is so we can use async/await
    index: ['babel-polyfill', './js/src/index.js']
  },
  externals: {
    jquery: 'jQuery',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'build'),
    libraryTarget: 'umd',
    globalObject: "(typeof window !== 'undefined' ? window : this)"
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      //{ // Re-Enable this if we want lint enforced during build
        //test: /\.jsx?$/,
        //enforce: "pre",
        //loader: 'eslint-loader',
        //options: {
          //configFile: '.eslintrc.json'
        //},
      //}
    ]
  }
};
