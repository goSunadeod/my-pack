const fs = require('fs')
const path = require('path')
const cheerio = require('cheerio')
class HtmlPlugin {  
  constructor (options) {
    this.template = options.template  //解析参数
    this.filename = options.filename
  }

  apply (compiler) {     //按照官方约定，定义apply方法，并将compiler作为参数传入
    compiler.hooks.afterEmit.tap('afterEmit',() => {   //订阅afterEmit钩子,在compiler.hooks.afterEmit.call()的时候执行下面的内容
      //读取模板内容
      const template = fs.readFileSync(path.resolve(process.cwd(),this.template), 'utf-8')    
      const $ = cheerio.load(template)  //通过cheerio解析template字符串

      //cheerio的api类似于jquery，这里我们生成一个script标签，并插入到body中
      const script = $(`<script src='./${compiler.output.filename}'></script>`)
      $('body').append(script)
      
      const htmlFile = $.html()   //基于修改后的dom重新生成字符串
      const output = path.resolve(compiler.output.path,this.filename)  
      fs.writeFileSync(output, htmlFile, 'utf-8') //将字符串写入到bundle.js所在的目录
    })
  }
}

module.exports = HtmlPlugin
