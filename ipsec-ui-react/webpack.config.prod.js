const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

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
        test: /\.(ttf)([\?]?.*)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]'
          }
        }
      },
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader'
      },
      { test: /\.(woff|woff2|eot|ttf)$/, use: ['url-loader?limit=100000'] }
    ]
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
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
      hooks: path.resolve(__dirname, 'src/hooks'),
      helpers: path.resolve(__dirname, 'src/helpers'),
      context: path.resolve(__dirname, 'src/context'),
      api: path.resolve(__dirname, 'src/api'),
      schema: path.resolve(__dirname, 'src/schema'),
      theme: path.resolve(__dirname, 'src/theme'),
      utils: path.resolve(__dirname, 'src/utils'),
      constant: path.resolve(__dirname, 'src/constants'),
      interface: path.resolve(__dirname, 'src/interface')
    }
  },
  output: {
    path: OUTPUT_PATH,
    filename: '[name].[chunkhash].js',
    publicPath: '/'
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    },
    runtimeChunk: {
      name: 'manifest'
    }
  },
  plugins: [new HtmlWebpackPlugin({ template: './src/index.html', favicon: './public/favicon.ico' }), new CleanWebpackPlugin(), new NodePolyfillPlugin()],
  devServer: {
    https: true,
    proxy: {
      '/api': {
        target: 'https://0.0.0.0:443',
        secure: false
      }
    },
    historyApiFallback: {
      index: OUTPUT_PATH
    },
    contentBase: OUTPUT_PATH
  }
};
