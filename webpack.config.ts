import { Configuration, DefinePlugin } from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';

const pjson = require('./package.json');

const isProductionBuild = process.env.NODE_ENV === 'production';

const config: Configuration = {
  entry: {
    'js-extension-sdk': './src/index.ts',
  },
  mode: isProductionBuild ? 'production' : 'development',

  // Enable sourcemaps for debugging webpack's output.
  devtool: isProductionBuild ? 'hidden-source-map' : 'source-map',

  resolve: {
    // Add '.ts' as resolvable extensions.
    extensions: ['.ts', '.js'],
  },
  target: 'web',
  plugins: [
    new DefinePlugin({
      __VERSION__: `'${pjson.version}'`,
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
