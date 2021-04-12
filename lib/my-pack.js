const path = require("path")
const Compiler = require("./Compiler")

let configPath = path.resolve(process.cwd(), './webpack.config.js')  //默认用项目根目录下的`webpack.config.js`

//获取命令行参数，如指定了--config，则获取紧跟其后的配置文件名
const argv = process.argv       
const index = argv.findIndex((value) => value === '--config')
if(index >= 0 && argv[index+1]){
  configPath = path.resolve(process.cwd(), argv[index+1])
}

const config = require(configPath)   //获取配置项
const compiler = new Compiler(config)  //将配置项传入Compiler

compiler.run()  //执行Compiler的run方法
