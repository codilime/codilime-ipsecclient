const webpack = require('webpack');
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin')

const OUTPUT_PATH =  path.resolve(__dirname, './dist');

module.exports = {
  entry: path.resolve(__dirname, './src/index.jsx'),
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.s[ac]ss$/i,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: ['file-loader']
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx'],
    alias: {
      components: path.resolve(__dirname, 'src/components'),
      common: path.resolve(__dirname, 'src/components/common'),
      template: path.resolve(__dirname, 'src/components/template'),
      layout: path.resolve(__dirname, 'src/components/layout'),
      pages: path.resolve(__dirname, 'src/components/pages'),
      style: path.resolve(__dirname, 'src/scss'),
      assets: path.resolve(__dirname, 'src/assets'),
      db: path.resolve(__dirname, 'src/db'),
      hooks: path.resolve(__dirname, 'src/_hooks'),
      helpers: path.resolve(__dirname, 'src/_helpers'),
      context: path.resolve(__dirname, 'src/_context'),
      api: path.resolve(__dirname, 'src/_api'),
      schema: path.resolve(__dirname, 'src/schema'),
      utils: path.resolve(__dirname, 'src/utils')
    }
  },
  output: {
    path: OUTPUT_PATH,
    filename: 'bundle.js',
    publicPath: OUTPUT_PATH,


  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({template: './src/index.html' }),
    new CleanWebpackPlugin()
  ],
  devServer: {
    proxy: {
      '/api': {
        target: 'http://172.17.0.2:80',
        secure: false
      }
    },
    historyApiFallback: {
        index: OUTPUT_PATH,
    },
    contentBase: OUTPUT_PATH,
    hot: true
  }
};
