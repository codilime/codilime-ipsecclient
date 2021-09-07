const webpack = require('webpack');
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const OUTPUT_PATH = path.resolve(__dirname, './dist');

module.exports = {
  entry: path.resolve(__dirname, './src/index.jsx'),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
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
      },
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader'
      },
      { test: /\.(woff|woff2|eot|ttf)$/, use: ['url-loader?limit=100000'] }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx', '.tsx'],
    alias: {
      components: path.resolve(__dirname, 'src/components'),
      common: path.resolve(__dirname, 'src/components/common'),
      template: path.resolve(__dirname, 'src/components/template'),
      layout: path.resolve(__dirname, 'src/components/layout'),
      pages: path.resolve(__dirname, 'src/components/pages'),
      style: path.resolve(__dirname, 'src/scss'),
      fonts: path.resolve(__dirname, 'src/assets/fonts'),
      images: path.resolve(__dirname, 'src/assets/images'),
      db: path.resolve(__dirname, 'src/db'),
      hooks: path.resolve(__dirname, 'src/_hooks'),
      helpers: path.resolve(__dirname, 'src/_helpers'),
      context: path.resolve(__dirname, 'src/_context'),
      api: path.resolve(__dirname, 'src/_api'),
      schema: path.resolve(__dirname, 'src/schema'),
      utils: path.resolve(__dirname, 'src/utils'),
      constant: path.resolve(__dirname, 'src/constants')
    }
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
    contentBase: OUTPUT_PATH,
    hot: true
  }
};
