
/**
 * 发布云服务器
 */

module.exports = async function () {
  const password = await this.getPasswordAssure()
  const tpl = process.argv[3]
  let dirname = process.argv[4]
  if (!dirname) {
    const pkg = this.requireFrom(this.dir.cwd, './package.json')
    if (pkg) dirname = pkg.publish || pkg.name
    if (!dirname) dirname = process.cwd().split('/').pop()
    this.console('您没有提供部署目录名，依次尝试 pkg.publish > pkg.name > __dirname，将自动使用工程目录名：' + dirname)
  }
  const url = `https://bapi.imaoda.com/npm/now?psw=${password}\\&dirname=${dirname}`
  if (!this.fs.existsSync('dist')) {
    this.console('当前路径没有 dist 文件夹')
    process.exit(1)
  }
  const data = this.execSync(`tar -zcf dist.tar.gz dist && curl -X POST --data-binary @dist.tar.gz ${url} && rm -f dist.tar.gz`)
  if (data.indexOf('已有') !== 0) {
    require("qrcode-terminal").generate(data);
    this.console(data)
  }
  else {
    const answer = await this.inquirer.prompt([{
      type: 'list',
      choices: ['不覆盖并放弃发布', '覆盖'],
      message: `已有同名目录${dirname}，是否覆盖`,
      name: 'force'
    }])
    if (answer.force == '覆盖') {
      const data = this.execSync(`tar -zcf dist.tar.gz dist && curl -X POST --data-binary @dist.tar.gz ${url + '\\&force=1'} && rm -f dist.tar.gz`)
      require("qrcode-terminal").generate(data);
      this.console(data)
    }
  }
}
