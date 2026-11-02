// webpack.config.js
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const WebpackObfuscator = require('webpack-obfuscator');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');
const dotenv = require('dotenv');
//const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');

dotenv.config();

const clientDevView = 'index';
const clientEntries = { index: './index.web.ts' };
const __DEV_PORT = process.env.DEV_PORT || 12345;
const __isDevelopment = process.env.NODE_ENV === 'development';
const __isLocalhost = false;

const __INLINE = process.env.INLINE === 'true';
const IS_INLINE = __INLINE;

const clientPlugins = [
    new webpack.DefinePlugin({
        'process.env.INLINE': JSON.stringify(IS_INLINE),
        __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
    }),
    !__isDevelopment &&
        new WebpackObfuscator(
            {
                rotateStringArray: true,
                stringArray: true,
                stringArrayThreshold: 0.75,
            },
            ['**/modules.*.js'],
        ),
        !IS_INLINE && new MiniCssExtractPlugin({
        filename: __isDevelopment
            ? '[name]/[name].css'
            : ({ chunk }) =>
                  chunk.name === 'main'
                      ? '[name].[contenthash].css'
                      : '[name]/[name].[contenthash].css',
    }),
    new webpack.IgnorePlugin({
        resourceRegExp: /initializers/,
        contextRegExp: /react-native-worklets/,
    }),
    //new BundleAnalyzerPlugin()
].filter(Boolean);

Object.keys(clientEntries).forEach((k) => {
    clientPlugins.push(
        new HtmlWebpackPlugin({
            template: './client/core/ui/assets/template.html',
            favicon: IS_INLINE ? undefined : './client/core/ui/assets/images/favicon.png',
            filename: `${k}/${k}.html`,
            inject: 'body',
            chunks: IS_INLINE 
                ? [k]
                : [
                    'modules',
                    'services',
                    'components',
                    'theme',
                    'styles',
                    'locales',
                    k,
                ],
            minify: !__isDevelopment && {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
            },
        }),
    );
});

if (IS_INLINE) {
    clientPlugins.push(
        new HtmlInlineScriptPlugin({
            scriptMatchPattern: [/.+\.js$/],
        }),
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1,
        })
    )
};

module.exports = {
    name: 'client',
    target: 'web',
    mode: __isDevelopment ? 'development' : 'production',
    devtool: __isDevelopment ? 'source-map' : false,
    entry: clientEntries,
    output: {
        path: path.resolve(__dirname, './public'),
        publicPath: '/',
        filename: __isDevelopment
            ? '[name]/[name].js'
            : ({ chunk }) =>
                  chunk.name === 'modules'
                      ? '[name].[contenthash].js'
                      : '[name]/[name].[contenthash].js',
        clean: true,
    },
    resolve: {
        extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js'],
        fullySpecified: false,
        alias: {
            '@root': path.resolve(__dirname),
            '@client': path.resolve(__dirname, 'client/'),
            '@styles': path.resolve(__dirname, 'client/core/ui/styles/'),
            '@ui': path.resolve(__dirname, 'client/core/ui/'),
            '@app': path.resolve(__dirname, 'client/modules/'),
            'react-native/Libraries/Renderer/shims/ReactNative':
                'react-native-web/dist/cjs/exports/ReactNative',
            'react-native$': 'react-native-web',
            'lodash-es': 'lodash',
        },
    },
    devServer: {
        host: __isLocalhost ? '127.0.0.1' : '0.0.0.0',
        port: __DEV_PORT,
        static: {
            directory: path.join(__dirname, 'public'),
            publicPath: '/',
            watch: true,
        },
        historyApiFallback: { index: `${clientDevView}/${clientDevView}.html` },
        hot: false,
        liveReload: true,
        open: true,
        compress: true,
        devMiddleware: { publicPath: '/' },
        watchFiles: ['client/**/*'],
        client: {
            overlay: {
              errors: true,
              warnings: true,
            },
          },
    },
    optimization: {
        usedExports: true,
        concatenateModules: true,
        splitChunks: (IS_INLINE || __isDevelopment)
            ? false
            : {
                  chunks: 'all',
                  cacheGroups: {
                      modules: {
                          test: /[\\/]node_modules[\\/]/,
                          name: 'modules',
                          chunks: 'all',
                      },
                      services: {
                          test: /[\\/]client[\\/]core[\\/]services[\\/]/,
                          name: 'services',
                          chunks: 'all',
                      },
                      components: {
                          test: /[\\/]client[\\/]core[\\/]ui[\\/]components[\\/]/,
                          name: 'components',
                          chunks: 'all',
                      },
                      theme: {
                          test: /[\\/]client[\\/]core[\\/]ui[\\/]theme[\\/]/,
                          name: 'theme',
                          chunks: 'all',
                      },
                      styles: {
                          test: /[\\/]client[\\/]core[\\/]ui[\\/]styles[\\/]/,
                          name: 'styles',
                          chunks: 'all',
                      },
                      locales: {
                          test: /[\\/]client[\\/]core[\\/]ui[\\/]locales[\\/]/,
                          name: 'locales',
                          chunks: 'all',
                      },
                  },
              },
        runtimeChunk: IS_INLINE ? false : 'single',
        minimize: !__isDevelopment,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: true,
                        drop_debugger: true,
                        pure_funcs: ['console.log', 'console.warn'],
                    },
                    output: { comments: false },
                },
                extractComments: false,
            }),
            new CssMinimizerPlugin(),
        ],
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx|ts|tsx)$/,
                exclude:
                    /node_modules\/(?!react-native|react-navigation|@react-native|react-native-)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',
                            '@babel/preset-react',
                            '@babel/preset-typescript',
                            '@react-native/babel-preset',
                        ],
                        plugins: [
                            [
                                '@babel/plugin-transform-react-jsx',
                                { runtime: 'automatic' },
                            ],
                        ],
                    },
                },
            },
            {
                test: /\.css$/,
                use: [
                    IS_INLINE
                        ? 'style-loader'
                        : MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader',
                ],
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                type: IS_INLINE ? 'asset/inline' : 'asset/resource',
                parser: { dataUrlCondition: { maxSize: 8192 } },
                generator: {
                    filename:
                        'assets/images/' +
                        (__isDevelopment
                            ? '[name].[ext]'
                            : '[name].[hash][ext]'),
                },
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: IS_INLINE ? 'asset/inline' : 'asset/resource',
                generator: {
                    filename:
                        'assets/fonts/' +
                        (__isDevelopment
                            ? '[name].[ext]'
                            : '[name].[hash][ext]'),
                },
            },
        ],
    },
    plugins: clientPlugins,
};
