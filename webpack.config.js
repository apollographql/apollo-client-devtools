module.exports = {
  entry: './components/build/panel.js',
  output: {
    filename: ".bundle.js",
    publicPath: '/'
  },
  module: {
    loaders: [{
      test: /\.css/,
      loader: ['style', 'css']
    }, {
      test: /\.jsx$/,
      loader: 'babel',
      exclude: /(node_modules)/
    }, {
      test: /\.json$/,
      loader: 'json'
    }]
  },
  devtool: "eval-source-map",
}
