const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const merge = require('webpack-merge')
const webpackBaseConfig = require('./webpack.base.config.js')
const fs = require('fs')
const package = require('../package.json')

fs.open('./build/env.js', 'w', function(err, fd) {
  const buf = 'export default "development";'
  // fs.write(fd, buf, 0, buf.length, 0, function(err, written, buffer) {});
  fs.write(fd, buf, 0, 'utf-8', function(err, written, buffer) {})
})

module.exports = merge(webpackBaseConfig, {
  devtool: '#source-map',
  output: {
    publicPath: '/dist/',
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
  },
  plugins: [
    new ExtractTextPlugin({
      filename: '[name].css',
      allChunks: true,
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: ['vender-exten', 'vender-base'],
      minChunks: Infinity,
    }),
    new HtmlWebpackPlugin({
      title: '后台管理系统',
      filename: '../index.html',
      inject: false,
    }),
    new CopyWebpackPlugin(
      [
        {
          from: 'src/views/main-components/theme-switch/theme',
        },
        {
          from: 'src/views/home/tinymce',
        },
      ],
      {
        ignore: ['text-editor.vue'],
      }
    ),
  ],
})
