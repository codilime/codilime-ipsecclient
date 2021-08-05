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
      api: path.resolve(__dirname, 'src/_api'),
      common: path.resolve(__dirname, 'src/components/common')
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
        target: 'http://172.18.0.2/',
        secure: false
      }
    },
    contentBase: path.resolve(__dirname, './dist'),
    hot: true
  }
};
