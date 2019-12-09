/**
 * 执行云 shell
 */

module.exports = async function () {
  const password = await this.getPasswordAssure()
  const tpl = process.argv[3]
  const list = await this.fetch(`https://bapi.imaoda.com/npm/getScripts?psw=${password}`).then(i => i.json())
  if (!list) {
    this.console('密码错误，请自行在 ~/.maoda/package.json 中修改密码')
    process.exit(1)
  }
  const listMap = this.abbrev(list)
  if (tpl && listMap[tpl]) {
    const realTpl = listMap[tpl]
    const msg = this.execSync(`curl -s https://www.imaoda.com/shell/scripts/${realTpl} | node`)
    process.stdout.write(msg)
  }
  if (!tpl) {
    const answer = await this.inquirer.prompt([{
      type: 'list',
      choices: list,
      name: 'tpl',
      message: '请选择一个脚本',
    }])
    const msg = this.execSync(`curl -s https://www.imaoda.com/shell/scripts/${answer.tpl} | node`)
    process.stdout.write(msg)
  }
}
