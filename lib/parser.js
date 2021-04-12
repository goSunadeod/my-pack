const fs = require('fs')
const path = require('path')
const babelParser = require("@babel/parser")
const traverse = require("@babel/traverse").default
const babel = require('@babel/core')
const root = process.cwd()

module.exports = {
  parse(filename, config) {
    const ast = this.genAST(filename,config)   //生成ast抽象语法树
    const dependencies = []
    const dirname = path.dirname(filename)
    traverse(ast, {
      // './hello.js'修改成'./src/hello.js' 与module里的key相对应
      CallExpression({node}){
        if(node.callee.name === 'require'){   //通过require导入
          let moduleFile = path.resolve(dirname, node.arguments[0].value)
          moduleFile = path.relative(root, moduleFile)
          moduleFile = './' + moduleFile.replace(/\\/g,'/')
          node.arguments[0].value = moduleFile   
          dependencies.push(moduleFile)      //加入依赖数组
        }
      },
      ImportDeclaration({node}){             //通过import导入
        let moduleFile = path.resolve(dirname, node.source.value)
        moduleFile = path.relative(root, moduleFile)
        moduleFile = './' + moduleFile.replace(/\\/g,'/')
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
    let sourceCode = fs.readFileSync(filename, 'utf-8')
    const ast = babelParser.parse(sourceCode,{
      sourceType: 'module'   //解析es6模块
    })
    return ast.program
  }
}