const HtmlWebpackPlugin = require('html-webpack-plugin');
const LinkTypePlugin = require('html-webpack-link-type-plugin').HtmlWebpackLinkTypePlugin;
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HTMLInlineCSSWebpackPlugin = require('html-inline-css-webpack-plugin').default;

// Try the environment variable, otherwise use root
const ASSET_PATH = process.env.ASSET_PATH || '/';

const htmlPlugins = [];

// htmlPlugins.push(
//  require('postcss-preset-env')({
//    browsers: 'last 2 versions',
//    root: ASSET_PATH
//  }));
htmlPlugins.push(new MiniCssExtractPlugin({
  filename: '[name].css',
  chunkFilename: '[id].css'
}));
htmlPlugins.push(...['index'].map(x => {
  return new HtmlWebpackPlugin({
    template: `./src/page-${x}/template.ejs`,
    inject: false,
    chunks: [x],
    minify: {
      collapseWhitespace: false,
      removeComments: false,
      removeRedundantAttributes: false,
      useShortDoctype: false
    },
    showErrors: true,
    options: {
      publicPath: ''
    },
    filename: `${x}.html`
  });
}));

htmlPlugins.push(new HTMLInlineCSSWebpackPlugin({
  replace: {
    removeTarget: true,
    target: '<!-- inline_css_plugin -->'
  }
}));
htmlPlugins.push(new LinkTypePlugin());

module.exports = {
  output: {
    publicPath: ASSET_PATH
  },

  // This option controls if and how source maps are generated.
  // https://webpack.js.org/configuration/devtool/
  devtool: 'source-map',

  // https://webpack.js.org/concepts/entry-points/#multi-page-application
  entry: {
    index: './src/page-index/main.js'
  },

  // https://webpack.js.org/configuration/dev-server/
  devServer: {
    port: 9001,
    writeToDisk: false // https://webpack.js.org/configuration/dev-server/#devserverwritetodisk-
  },

  // https://webpack.js.org/concepts/loaders/
  module: {
    rules: [{
      test: /\.js$/i,
      exclude: /node_modules/,
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env']
      }
    },
    {
      test: /\.((c|sa|sc)ss)$/i,
      use: [
        // Creates `style` nodes from JS strings
        MiniCssExtractPlugin.loader,
        // Translates CSS into CommonJS
        'css-loader',
        // Compiles Sass to CSS
        'sass-loader'
      ]
    },
    {
      // Load all images as base64 encoding if they are smaller than 8192 bytes
      test: /\.(png|jpe?g|gif|svg)$/i,
      use: [{
        loader: 'url-loader',
        options: {
          publicPath: '',
          // On development we want to see where the file is coming from, hence we preserve the [path]
          name: '[path][name].[ext]?hash=[hash:20]',
          esModule: false,
          limit: 8192
        }
      }]
    }
    ]
  },

  // https://webpack.js.org/concepts/plugins/
  plugins: htmlPlugins
};
