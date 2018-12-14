const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = common.map((c, index) => (
  merge(c, {
    mode: 'production',
    devtool: 'none',
    plugins: [
      // clean-out the dist dir once at the start
      (index === 0 ? new CleanWebpackPlugin(['dist']) : () => {}),
    ],
  })
));
