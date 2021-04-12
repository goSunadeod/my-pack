const path = require('path')
module.exports = {
  mode: 'none',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          path.resolve(__dirname, 'lib/loaders/remove-console-loader.js'),
          path.resolve(__dirname, 'lib/loaders/add-author-loader.js')
        ]
      }
    ]
  },
}
