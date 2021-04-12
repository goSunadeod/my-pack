// 打包过程
const fs = require('fs')
const path = require('path')
const parser = require('./parser')
class Compiler {
  constructor(config) {  //解析配置选项
    this.config = config
    this.entry = config.entry
    this.output = config.output
    this.execPath = process.cwd()  //Node.js 进程的当前工作目录，在这里也就是项目根目录
    this.modules = Object.create(null)   //用于所有依赖文件生成的module的集合
  }

  run() {  //主要分为以下两个步骤
    this.buildModule(path.resolve(this.execPath, this.entry))  //构建依赖关系图
    this.emitFile()    //生成打包文件
  }
  buildModule(filename) {
    let key = path.relative(this.execPath, filename)    //获取文件基于项目根目录的相对路径，作为它在module集合的key
    key = './' + key.replace(/\\/g, '/')
    if (this.modules[key]) return  //如果模块已经存在于集合中，则返回

    //编译解析文件，得到转换成es5的文件源码和它的依赖数组
    const { dependencies, code } = parser.parse(filename, this.config)
    this.modules[key] = {  //根据文件源码和它的依赖数组生成module，并加入到依赖集合中
      code: code,
      dependencies: dependencies
    }

    //遍历文件的依赖数组，递归执行buildModule方法，直到遍历完所有依赖文件，这时this.modules中将是项目所有依赖module的集合
    dependencies.forEach((dependency) => {
      const absPath = path.resolve(this.execPath, dependency)
      this.buildModule(absPath)
    })
  }


  // 生成webpack的bundle
  emitFile() {
    const output = path.resolve(this.output.path, this.output.filename)
    console.log(output);
    let modules = ''
    Object.keys(this.modules).forEach((key) => {
      modules += `'${key}': function(require, module, exports){
        ${this.modules[key].code}
      },`

    })
    const bundle = `(function(modules){
      var installedModules = {}
      function require(filename){
        if(installedModules[filename]) {
			    return installedModules[filename].exports;		
        }

        var module = installedModules[filename] = {
          exports: {} 
        };

        var fn = modules[filename]

        fn(require, module, module.exports)
        return module.exports
      }
      require('${this.entry}')
    })({
      ${modules}
    })`
    this.createFolder(output);
    fs.writeFileSync(output, bundle, 'utf-8')
  }

  createFolder(to) { //文件写入
    var sep = path.sep
    var folders = path.dirname(to).split(sep);
    var p = '';
    while (folders.length) {
      p += folders.shift() + sep;
      if (!fs.existsSync(p)) {
        fs.mkdirSync(p);
      }
    }
  }
}
module.exports = Compiler
