const webpack = require('webpack');
const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const OUTPUT_PATH = path.resolve(__dirname, './dist');

module.exports = {
  entry: path.resolve(__dirname, './src/index.tsx'),
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: ['ts-loader']
      },
      {
        test: /\.s[ac]ss$/i,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: ['file-loader']
      },
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader'
      },
      { test: /\.(woff|woff2|eot|ttf)$/, use: ['url-loader?limit=100000'] }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx', '.ts', 'tsx']
  },
  output: {
    path: OUTPUT_PATH,
    filename: 'bundle.js',
    publicPath: OUTPUT_PATH
  },
  plugins: [new webpack.HotModuleReplacementPlugin(), new HtmlWebpackPlugin({ template: './src/index.html' }), new CleanWebpackPlugin()],
  devServer: {
    proxy: {
      '/api': {
        target: 'http://0.0.0.0:80',
        secure: false
      }
    },
    historyApiFallback: {
      index: OUTPUT_PATH
    },
    contentBase: OUTPUT_PATH
  }
};
