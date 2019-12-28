const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader'
        ]
      },
      {
        test: /\.exec\.js$/,
        use: ['script-loader']
      }
    ]
  },
  plugins: [
    //will automatically inject bundle js into ./dist/index.html
    new HTMLWebpackPlugin({
      template: './src/index.html', //source
      filename: 'index.html' //destination
    }),
    new ExtractTextPlugin('style.css')
  ]
};
