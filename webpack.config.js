var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin');
var HTMLWebpackPluginConfig = new HtmlWebpackPlugin({
  template: __dirname + '/app/index.html',
  filename: 'index.html',
  inject: 'body'
});

const plugins = [
  HTMLWebpackPluginConfig,
  new webpack.IgnorePlugin(/\.flow$/)
];
if (process.env.NODE_ENV === 'production') {
  plugins.push(
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    })
  )
}
module.exports = {
  entry: ['./app/index.js'],
  output: {
    filename: "index_bundle.js",
    path: __dirname + '/extension/dist'
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: "style-loader!css-loader"
      },
      {
        test: /\.json$/,
        loader: "json-loader"
      },
      {
        test: /\.less$/,
        loader: "style-loader!css-loader!less-loader"
      },
      {
        test: /\.js$/,
        include: __dirname + '/app',
        loader: "babel-loader",
        exclude: /(node_modules)/
      }
    ]
  },
  plugins: plugins
}
