const path = require('path')
const HtmlPlugin = require('./lib/plugins/html-plugin')
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
  plugins: [
    new HtmlPlugin({
      template: './src/index.html',   //用到的模板文件
      filename: 'newIndex.html'       //生成的html文件命名
    })
  ]
}
