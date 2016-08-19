const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const NpmInstallPlugin = require('npm-install-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');


const pkg = require('./package.json');
const TARGET = process.env.npm_lifecycle_event;
const PATHS = {
  src: path.join(__dirname, 'src'),
  dist: path.join(__dirname, 'dist'),
  style: path.join(__dirname, 'src/main.css'),
};

const common = {
  entry: {
    src: PATHS.src,
    style: PATHS.style,
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
  module: {
    loaders: [
      {
        test: /\.(jpg|png)$/,
        loader: 'file?name=[path][name].[hash].[ext]',
        // include: PATHS.images,
      },
      {
        'test': /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?/,
        loader: 'url',
        query: {
          prefix: 'font/',
          limit: 10000,
          mimetype: 'application/font-woff',
        },
        // include: PATHS.fonts,
      },
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?/,
        loader: 'url',
        // include: PATHS.fonts,
      },
    ],
  },
  output: {
    path: PATHS.dist,
    filename: '[name].js',
    publicPath: '/'
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'router blog',
    }),
  ],
};

// Default Config
if (TARGET === 'start' || !TARGET) {
  module.exports = merge(common, {
    devtool: 'eval-source-map',
    devServer: {
      contentBase: PATHS.dist,

      historyApiFallback: true,
      hot: true,
      inline: true,
      progress: true,

      stats: 'errors-only',

      host: process.env.HOST,
      port: process.env.PORT,
    },
    module: {
      loaders: [
        // Define dev-specific CSS setup
        {
          test: /\.css$/,
          loaders: ['style', 'css'],
          include: PATHS.src,
        },
        {
          test: /\.jsx?$/,
          loader: 'babel',
          query: {
            cacheDirectory: true,
            presets: ['react', 'es2015', 'stage-1','react-hmre'],
            plugins: ['transform-decorators-legacy', 'transform-object-assign', 'array-includes'],
          },
          include: PATHS.src,
        },
      ],
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new NpmInstallPlugin({
        save: true,
      }),
    ],
  });
}

if (TARGET === 'build') {
  module.exports = merge(common, {
    // devtool: 'source-map',
    entry: {
      // flag all `package.json` dependencies as vendor files
      vendor: Object.keys(pkg.dependencies),
    },
    output: {
      path: PATHS.build,
      filename: '[name].js',
      // Create a hash for each file in the build so we can detect which files have changed
      // filename: '[name].[chunkhash].js',
      // chunkFilename: '[chunkhash].js',
    },
    module: {
      loaders: [
        // Extract CSS during the build process
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract('style', 'css'),
          include: PATHS.src,
        },
        {
          test: /\.jsx?$/,
          loader: 'babel',
          query: {
            cacheDirectory: true,
            presets: ['react', 'es2015', 'stage-1','react-hmre'],
            plugins: ['transform-decorators-legacy', 'transform-object-assign', 'array-includes'],
          },
          include: PATHS.src,
        },
      ],
    },
    plugins: [
      // Clear the contents of the build directory before re-building
      new CleanWebpackPlugin(PATHS.dist),
      // Output extracted CSS to its own file
      new ExtractTextPlugin('[name].css'),
      // new ExtractTextPlugin('[name].[chunkhash].css'),
      // Split dependencies into a `vendor` file and provide a manifest
      new webpack.optimize.CommonsChunkPlugin({
        names: ['vendor', 'manifest'],
      }),
      // Use the `production` flag so we get full optimization from React when building
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': '"production"',
      }),
      // Minify the resulting bundle
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
        },
      }),
    ],
  });
}
