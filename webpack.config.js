const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const dotenv = require('dotenv');

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';

  // Load .env.production or .env.development, fall back to .env
  const envFile = isProd ? '.env.production' : '.env.development';
  const envPath = path.resolve(__dirname, envFile);
  const fallbackPath = path.resolve(__dirname, '.env');
  const rawEnv = fs.existsSync(envPath)
    ? dotenv.parse(fs.readFileSync(envPath))
    : fs.existsSync(fallbackPath)
      ? dotenv.parse(fs.readFileSync(fallbackPath))
      : {};

  const envKeys = {
    'process.env': JSON.stringify({
      NODE_ENV: argv.mode || 'development',
      ...rawEnv,
    }),
  };

  const devPort = parseInt(rawEnv.REACT_APP_DEV_PORT || '5173', 10);
 
  return {
    entry: './src/index.jsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      // Separate chunk filenames for better long-term caching
      filename: isProd ? 'js/[name].[contenthash:8].js' : 'js/[name].js',
      chunkFilename: isProd
        ? 'js/[name].[contenthash:8].chunk.js'
        : 'js/[name].chunk.js',
      clean: true,
      publicPath: '/',
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              // Cache Babel transforms between builds
              cacheDirectory: true,
              cacheCompression: false,
            },
          },
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader', 'postcss-loader'],
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx'],
    },
    plugins: [
      new webpack.DefinePlugin(envKeys),
      new HtmlWebpackPlugin({
        template: './public/index.html',
        filename: 'index.html',
        // Minify HTML in production
        minify: isProd
          ? {
              collapseWhitespace: true,
              removeComments: true,
              removeRedundantAttributes: true,
              removeScriptTypeAttributes: true,
              removeStyleLinkTypeAttributes: true,
              useShortDoctype: true,
            }
          : false,
      }),
      // Copy all public/ static assets (images, icons, etc.) to dist/
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'public'),
            to: path.resolve(__dirname, 'dist'),
            globOptions: {
              ignore: ['**/index.html'], // HtmlWebpackPlugin handles this
            },
          },
        ],
      }),
    ],
    optimization: {
      // Split vendor (node_modules) into its own long-lived cached chunk
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          // React + ReactDOM in their own chunk (changes rarely)
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
            name: 'vendor-react',
            chunks: 'all',
            priority: 20,
          },
          // Redux + RTK in their own chunk
          redux: {
            test: /[\\/]node_modules[\\/](@reduxjs|react-redux)[\\/]/,
            name: 'vendor-redux',
            chunks: 'all',
            priority: 10,
          },
          // Everything else from node_modules
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 1,
          },
        },
      },
      // Keep the webpack runtime in its own tiny chunk
      runtimeChunk: 'single',
    },
    devServer: {
      static: {
        directory: path.join(__dirname, 'public'),
      },
      historyApiFallback: true,
      port: devPort,
      hot: true,
      open: true,
      compress: true,
      // Proxy /api/* → backend so browser never sees a CORS error in dev
      proxy: {
        '/api': {
          target: rawEnv.REACT_APP_API_BASE_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    // Source maps: fast in dev, hidden in prod (no source leakage)
    devtool: isProd ? 'hidden-source-map' : 'eval-cheap-module-source-map',
  };
};
