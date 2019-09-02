/**
 * 文件夹拷贝
 */

module.exports = async function () {
  const password = await this.getPasswordAssure()
  const tpl = process.argv[3]
  const list = await this.fetch(`https://bapi.imaoda.com/npm/list?psw=${password}`).then(i => i.json())
  if (!list) {
    this.console('密码错误，请自行在 ~/.maoda/package.json 中修改密码')
    process.exit(1)
  }
  const listMap = this.abbrev(list)
  if (tpl && listMap[tpl]) {
    const realTpl = listMap[tpl]
    const filePath = await this.fetch(`https://bapi.imaoda.com/npm/down/${realTpl}?psw=${password}`).then(i => i.text())
    exec(`wget ${filePath} && tar -zxf repo.tar.gz && rm repo.tar.gz`)
  }
  if (!tpl) {

  }
}
