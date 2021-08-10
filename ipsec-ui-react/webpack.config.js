const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, './src/index.js'),
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
      style: path.resolve(__dirname, 'src/css'),
      assets: path.resolve(__dirname, 'src/assets'),
      db: path.resolve(__dirname, 'src/db'),
      hooks: path.resolve(__dirname, 'src/_hooks'),
      helpers: path.resolve(__dirname, 'src/_helpers'),
      context: path.resolve(__dirname, 'src/_context'),
      api: path.resolve(__dirname, 'src/_api'),
      pages: path.resolve(__dirname, 'src/components/pages')
    }
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js'
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
  devServer: {
    proxy: {
      '/api': {
        target: 'http://172.17.0.2:80',
        secure: false
      }
    },
    contentBase: path.resolve(__dirname, './dist'),
    hot: true
  }
};
