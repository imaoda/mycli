const fs = require("fs");
const path = require("path");
const execSync = require("child_process").execSync;

class Utils {
  /**
   * 获取某个包的安装情况
   * 返回 0 表示未安装 1 表示安装并非最新 2 表示安装最新
   */
  getInstalledStatus(pkgName, targetDir) {
    const genObj = this.getInstalledPkgs(targetDir);
    if (!genObj[pkgName]) return 0;
    const lts = execSync(`npm view ${pkgName} version --json --registry=https://registry.npm.taobao.org`) + '' // buffer 转 string
    const current = this.requireFrom(targetDir, path.join(pkgName, "package.json")).version;
    if (current === lts.trim()) return 2;
    return 1;
  }

  /**
   * 获取路径下已经安装的 generator 包
   */
  getInstalledGenerators(targetDir) {
    const dependencies = this.getInstalledPkgs(targetDir);
    Object.keys(dependencies).forEach(v => {
      if (!v.match(/^gen-/)) delete dependencies[v];
    });
    return dependencies;
  }

  /**
   * 获取路径下已经安装的包
   */
  getInstalledPkgs(targetDir) {
    const pkgJsonFile = path.resolve(targetDir, "package.json");
    if (!fs.existsSync(pkgJsonFile)) return {};
    const pkgJson = require(pkgJsonFile);
    return pkgJson.dependencies || {};
  }

  /**
   * 获取 .maoda 下的秘钥
   */
  getPassword() {
    const pkg = this.requireFrom(this.dir.tpl, './package.json')
    return pkg.password
  }

  /**
   * 设置 .maoda 下的秘钥
   */
  setPassword(str) {
    const pkg = this.requireFrom(this.dir.tpl, './package.json')
    pkg.password = str
    fs.writeFileSync(path.join(this.dir.tpl, 'package.json'), JSON.stringify(pkg, null, 2))
  }

  /**
   * 初次设置密码，如不慎设置错误，请后续自行在 .maoda 里修改
   */
  async getPasswordAssure() {
    let pwd = this.getPassword()
    if (pwd) return pwd
    const answer = await this.inquirer.prompt([{
      type: 'input',
      name: 'password',
      message: '您还未提供10位云服务器秘钥'
    }])
    this.setPassword(answer.password)
    return answer.password
  }

  /**
   * 获取 build 方法
   */
  getBuilderFn() {
    const { builder } = this.getConfigs();
    const status = this.getInstalledStatus(builder, process.cwd());
    switch (status) {
      case 0:
        this.console(
          `检测到工程并未添加${builder}，将自动为您安装最新版`,
          "red"
        );
        this.console(`安装${builder}中...`);
        execSync(
          `npm i ${builder}@latest -S --registry=https://registry.npm.taobao.org`,
          { cwd: process.cwd() }
        );
        break;
      case 1:
        this.console(
          `检测到您的${builder}并非最新版，推荐在工程下 npm i ${builder}@latest -S 进行更新`
        );
        break;
      default:
    }
    return this.requireFrom(process.cwd(), builder);
  }

  getConfigs() {
    const configs = this.requireFrom(process.cwd(), "./maoda.js");
    if (!configs || !configs.builder) {
      this.console(
        "请确保工程根路径下有 maoda.js 文件，且文件中配置了 builder 属性",
        "red"
      );
      process.exit(1);
    }
    return configs;
  }
}

module.exports = Utils;
