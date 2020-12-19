const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const LinkTypePlugin = require('html-webpack-link-type-plugin').HtmlWebpackLinkTypePlugin;
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HTMLInlineCSSWebpackPlugin = require('html-inline-css-webpack-plugin').default;
const BeautifyHtmlWebpackPlugin = require('beautify-html-webpack-plugin');
const path = require('path');

// Try the environment variable, otherwise use root
const ASSET_PATH = process.env.ASSET_PATH || '/';

const htmlPlugins = [];

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

htmlPlugins.push(new BeautifyHtmlWebpackPlugin({
  indent_size: 4,
  indent_char: ' ',
  indent_with_tabs: false,
  editorconfig: true,
  eol: '\n',
  end_with_newline: false,
  indent_level: 0,
  preserve_newlines: true,
  max_preserve_newlines: 2,
  space_in_paren: false,
  space_in_empty_paren: false,
  jslint_happy: false,
  space_after_anon_function: false,
  space_after_named_function: false,
  brace_style: 'collapse',
  unindent_chained_methods: false,
  break_chained_methods: false,
  keep_array_indentation: false,
  unescape_strings: false,
  wrap_line_length: 0,
  e4x: false,
  comma_first: false,
  operator_position: 'before-newline',
  indent_empty_lines: false,
  templating: ['auto']
}));

htmlPlugins.push(new CleanWebpackPlugin({
  // Simulate the removal of files
  dry: false,

  // Write Logs to Console
  verbose: true,

  // Automatically remove all unused webpack assets on rebuild
  cleanStaleWebpackAssets: false,

  // Do not allow removal of current webpack assets
  protectWebpackAssets: false,

  // Removes files once prior to Webpack compilation
  //   Not included in rebuilds (watch mode)
  cleanOnceBeforeBuildPatterns: ['**/*'],

  // Removes files after every build (including watch mode) that match this pattern.
  // Used for files that are not created directly by Webpack.
  //
  // Use !negative patterns to exclude files
  cleanAfterEveryBuildPatterns: ['*.js*'],

  // Allow clean patterns outside of process.cwd()
  // requires dry option to be explicitly set
  dangerouslyAllowCleanPatternsOutsideProject: false
}));

module.exports = {
  output: {
    publicPath: ASSET_PATH,
    path: path.resolve(__dirname, 'dist')
  },

  stats: {
    preset: 'errors-warnings',
    errorsCount: true,
    chunks: false,
    children: true,
    colors: true
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
        'sass-loader',
        {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              plugins: [
                [
                  'postcss-preset-env',
                  {
                    browsers: [
                      'last 1 version',
                      '> 1%',
                      'IE 10'
                    ]
                  }
                ],
                require('stylefmt'),
                require('colorguard'),
                require('autoprefixer')
              ]
            }
          }
        }
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
