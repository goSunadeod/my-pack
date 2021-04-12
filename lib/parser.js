const fs = require('fs')
const path = require('path')
const babelParser = require("@babel/parser")
const traverse = require("@babel/traverse").default
const babel = require('@babel/core')
const root = process.cwd()

module.exports = {
  initLoader(filename, config) {
    let source = fs.readFileSync(filename, 'utf8')
    const rules = config.module && config.module.rules   //获取rules数组
    rules && rules.forEach((rule) => {     //遍历rules
      const { test, use } = rule           //获取匹配规则和loader数组
      let l = use.length - 1
      if (test.test(filename)) {             //文件名如匹配得上
        function execLoader() {
          const loader = require(use[l--])   //从最后一个loader开始执行 （loader的执行顺序是从右向左）
          source = loader(source)            //将执行结果重新赋给source
          if (l >= 0) {                //如果前面还有loader，执行loader，直到use数组里的所有loader执行完毕
            execLoader()
          }
        }
        execLoader()
      }
    })
    return source
  },
  parse(filename, config) {
    const ast = this.genAST(filename, config)   //生成ast抽象语法树
    const dependencies = []
    const dirname = path.dirname(filename)
    traverse(ast, {
      // './hello.js'修改成'./src/hello.js' 与module里的key相对应
      CallExpression({ node }) {
        if (node.callee.name === 'require') {   //通过require导入
          let moduleFile = path.resolve(dirname, node.arguments[0].value)
          moduleFile = path.relative(root, moduleFile)
          moduleFile = './' + moduleFile.replace(/\\/g, '/')
          node.arguments[0].value = moduleFile
          dependencies.push(moduleFile)      //加入依赖数组
        }
      },
      ImportDeclaration({ node }) {             //通过import导入
        let moduleFile = path.resolve(dirname, node.source.value)
        moduleFile = path.relative(root, moduleFile)
        moduleFile = './' + moduleFile.replace(/\\/g, '/')
        node.source.value = moduleFile
        dependencies.push(moduleFile)        //加入依赖数组
      }
    })
    const { code } = babel.transformFromAst(ast, null, {    //基于ast生成es5代码
      presets: ["@babel/preset-env"]
    })
    return {       //返回解析后的es5代码和依赖数组
      code,
      dependencies
    }
  },
  genAST(filename, config) {
    const sourceCode = this.initLoader(filename,config)  //先使用loader处理文件，返回处理后的结果
    // let sourceCode = fs.readFileSync(filename, 'utf-8')
    const ast = babelParser.parse(sourceCode, {
      sourceType: 'module'   //解析es6模块
    })
    return ast.program
  }
}