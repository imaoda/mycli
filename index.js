const fs = require('fs')
const chalk = require('chalk')
const resolveFrom = require('resolve-from').silent
const requireFrom = require('import-from').silent
const path = require('path')
const abbrev = require('abbrev')
const inquirer = require('inquirer')
const yoemanEnv = require('yeoman-environment').createEnv()
const pkg = require('./package.json')
const execSync = require('child_process').execSync
const args = require('minimist')(process.argv)
const fetch = require('node-fetch');
const cmdDirName = 'script'
const homedir = require('os').homedir()
const Utils = require('./utils')

class M extends Utils {
  constructor(args) {
    super()
    this.args = args
    this.bindTools()
    this.checkTplDir()
    const cmdArr = fs.readdirSync(path.resolve(__dirname, cmdDirName)).map(item => item.split('.')[0])
    const cmdArrAbb = abbrev(cmdArr) // 支持简写
    if (!cmdArrAbb[process.argv[2]]) { // 未提供命令，或者提供了错误的命令，则报错
      this.console('命令错误，请使用：' + JSON.stringify(cmdArr))
      process.exit(1)
    }
    const cmd = require(path.resolve(__dirname, cmdDirName, process.argv[2]))
    // this.checkCliUpdate() // 不主动检查更新，以加快执行速度
    cmd.call(this)
  }
  bindTools() {
    this.chalk = chalk
    this.resolveFrom = resolveFrom
    this.requireFrom = requireFrom
    this.dir = {
      home: homedir,
      tpl: path.join(homedir, '.maoda'),
      cwd: process.cwd(),
    }
    this.yoemanEnv = yoemanEnv
    this.inquirer = inquirer
    this.fetch = fetch
    this.abbrev = abbrev
  }
  checkCliUpdate() {
    const pkgName = pkg.name
    const version = pkg.version
    const ltsVersion = execSync(`npm view ${pkgName} version --registry=https://registry.npm.taobao.org`) + '' // 返回 buffer 转 string
    if (ltsVersion.trim() !== version) this.console(`cli 版本过旧，建议执行 npm i -g ${pkgName}@latest 升级 cli： ${version} -> ${ltsVersion} `)
  }
  checkTplDir() {
    execSync(`mkdir -p ${this.dir.tpl}`)
    const pkgFile = path.resolve(this.dir.tpl, 'package.json')
    if (!fs.existsSync(pkgFile)) {
      fs.writeFileSync(pkgFile, JSON.stringify({ name: '_', description: '_', repository: '_', license: 'MIT', password: '' }, null, 2))
    }
  }
  console(data, color = 'yellow') {
    const fn = chalk[color] || chalk.yellow
    console.log(fn(data))
  }
}

module.exports = new M(args)
