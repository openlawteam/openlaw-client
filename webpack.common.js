const path = require('path');
const webpack = require('webpack');

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
    globalObject: '(typeof window !== \'undefined\' ? window : this)'
  },
  target: 'node',
  node: {
    process: false
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ],
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
