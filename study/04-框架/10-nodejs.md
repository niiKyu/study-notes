#### 1、设置npm路径

```sh
#全局安装路径
npm config set prefix "D:\Program Files\nodejs\node_global"
#缓存路径
npm config set cache "D:\Program Files\nodejs\node_cache"
```

#### 2、设置镜像

```sh
#1,淘宝镜像源
npm config set registry https://registry.npmmirror.com
npm config set registry https://registry.npm.taobao.org
#2,腾讯云镜像源
npm config set registry http://mirrors.cloud.tencent.com/npm/
#3,华为云镜像源
npm config set registry https://mirrors.huaweicloud.com/repository/npm/
# 官方默认全局镜像
npm config set registry https://registry.npmjs.org
#检查当前镜像
npm config get registry
```

#### 3、常用命令简写说明

```text
-g： #--global 的缩写，表示安装到全局目录里
-S： #--save 的缩写，表示安装的包将写入package.json里面的dependencies
-D： #--save-dev 的缩写，表示将安装的包将写入packege.json里面的devDependencies
 i： #install的缩写，表示安装
```

#### 4、安装模块

```sh
npm init  # npm 初始化当前目录
npm i   # 安装所有依赖
npm install   # 安装所有依赖
npm i express  # 安装模块到默认dependencies
# 安装指定版本和临时源
npm install -g express@2.5.8 --registry=https://registry.npm.taobao.org
npm i express -g  # 会安装到配置的全局目录下
npm i express -S  # 安装包信息将加入到dependencies生产依赖
npm i express -D  # 安装包信息将加入到devDependencies开发依赖
```
#### 5、卸载模块

```sh
npm uninstall express  # 卸载模块，但不卸载模块留在package.json中的对应信息
npm uninstall express -g  # 卸载全局模块
npm uninstall express --save  # 卸载模块，同时卸载留在package.json中dependencies下的信息
npm uninstall express --save-dev  # 卸载模块，同时卸载留在package.json中devDependencies下的信息
```
#### 6、更新模块

```sh
npm update express  # 更新最新版本的express
npm update express@2.1.0  # 更新到指定版本号的express
npm update express@latest  # 更新到最后的新版本
```
#### 7、查看命令

```sh
npm -v   #查看版本号
npm root  # 查看项目中模块所在的目录
npm root -g  # 查看全局安装的模块所在目录
npm list 或者 npm ls  # 查看本地已安装模块的清单列表
npm view express dependencies  # 查看某个包对于各种包的依赖关系
npm view express version  # 查看express最新的版本号
npm view express versions  # 查看所有express历史版本号（很实用）
npm view express  # 查看最新的express版本的信息
npm info express  # 查看express的详细信息，等同于上面的npm view express
npm list express 或 npm ls express  # 查看本地已安装的express的详细信息
npm view express repository.url  # 查看express包的来源地址
```
#### 8、其他命令

```sh
npm cache clean  # 清除npm的缓存
npm prune  # 清除项目中没有被使用的包
npm outdated  # 检查模块是否已经过时
npm repo express  # 会打开默认浏览器跳转到github中express的页面
npm docs express  # 会打开默认浏览器跳转到github中express的README.MD文件信息
npm home express  # 会打开默认浏览器跳转到github中express的主页
npm install -g npm@9.8.1 # 升级npm
```

#### 9、通过使用淘宝定制的cnpm安装

```sh
npm install -g cnpm --registry=https://registry.npmmirror.com
npm install -g cnpm --registry=https://registry.npm.taobao.org
# 查看版本号
cnpm -v
```
#### 10、yarn用法

```sh
1、安装yarn 
npm install -g yarn

2、安装成功后，查看版本号： 
yarn --version

3、初始化项目 
yarn init # 同npm init，执行输入信息后，会生成package.json文件
yarn的配置项： 
yarn config list # 显示所有配置项
yarn config get <key> # 显示某配置项
yarn config delete <key> # 删除某配置项
yarn config set <key> <value> [-g|--global] #设置配置项
yarn config set registry https://registry.npmmirror.com # 添加淘宝源

4、安装包： 
yarn install # 安装package.json里所有包，并将包及它的所有依赖项保存进yarn.lock
yarn install --flat # 安装一个包的单一版本
yarn install --force # 强制重新下载所有包
yarn install --production # 只安装dependencies里的包
yarn install --no-lockfile # 不读取或生成yarn.lock
yarn install --pure-lockfile # 不生成yarn.lock

5、添加包（会更新package.json和yarn.lock）
yarn add [package] #  在当前的项目中添加一个依赖包，会自动更新到package.json和yarn.lock文件中
yarn add [package]@[version] #  安装指定版本，这里指的是主要版本，如果需要精确到小版本，使用-E参数
yarn add [package]@[tag] #  安装某个tag（比如beta,next或者latest）

# 不指定依赖类型默认安装到dependencies里，你也可以指定依赖类型：
yarn add --dev/-D #  加到 devDependencies
yarn add --peer/-P #  加到 peerDependencies
yarn add --optional/-O #  加到 optionalDependencies
```
#### 11、npm和yarn对比

| npm                             | yarn                    |
| ------------------------------- | ----------------------- |
| npm install                     | yarn                    |
| npm install 依赖包名 --save-dev | yarn add 依赖包名 --dev |
| npm install 依赖包名 --save     | yarn add 依赖包名       |
| npm run serve                   | yarn serve              |
| npm run build                   | yarn build              |