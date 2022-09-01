import { Configuration, DefinePlugin } from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';

const pjson = require('./package.json');

const isProductionBuild = process.env.NODE_ENV === 'production';

const config: Configuration = {
  entry: {
    'js-extension-sdk': './src/index.ts',
  },
  mode: isProductionBuild ? 'production' : 'development',
  // output: {
  //     filename: isProductionBuild ? '[name].[contenthash].js' : '[name].js',
  //     chunkFilename: isProductionBuild ? '[name].[contenthash].js' : '[name].js',
  //     path: path.resolve(baseDir, 'dist'),
  //     publicPath: buildPublicPath(environmentType),
  //     // https://webpack.js.org/guides/build-performance/#output-without-path-info
  //     pathinfo: false,
  //   },

  // Enable sourcemaps for debugging webpack's output.
  devtool: isProductionBuild ? 'hidden-source-map' : 'source-map',

  resolve: {
    // Add '.ts' as resolvable extensions.
    extensions: ['.ts', '.js'],
  },
  target: 'web',
  plugins: [
    new DefinePlugin({
      __VERSION__: pjson.version,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                noUnusedParameters: isProductionBuild,
                noUnusedLocals: isProductionBuild,
              },
            },
          },
        ],
      },
    ],
  },
  optimization: {
    minimize: isProductionBuild,
    minimizer: [
      new TerserPlugin({
        parallel: 2,
      }),
    ],
  },
};

export default config;
