const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = common.map((c, index) => (
  merge(c, {
    mode: 'development',
    devtool: 'source-map',
    plugins: [
      // clean-out the dist dir once at the start
      (index === 0 ? new CleanWebpackPlugin(['dist']) : () => {}),
    ],
  })
));
