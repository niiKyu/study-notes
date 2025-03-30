# Git使用教程

## Git安装

windows安装：进入网站[https://git-scm.com/下载安装，然后在cmd命令行配置](https://git-scm.com/下载安装，然后在cmd命令行配置)

直接去腾讯软件中心下载也可以！

```php
> git config --global user.name "itnanls"
> git config --global user.email "itnanls@163.com"
#检查信息是否写入成功
git config --list 
```

ubuntu配置：apt-get install git

centos配置：yum install git

## 实战

### 1、初始化Git

#### （1）初次运行 Git 前的配置

既然已经在系统上安装了 Git，你会想要做几件事来定制你的 Git 环境。 每台计算机上只需要配置一次，程序升级时会保留配置信息。 你可以在任何时候再次通过运行命令来修改它们。

Git 自带一个 `git config` 的工具来帮助设置控制 Git 外观和行为的配置变量。

在 Windows 系统中，Git 会查找 `$HOME` 目录下（一般情况下是 `C:\Users\$USER` ）的 `.gitconfig` 文件。

你可以通过以下命令查看所有的配置以及它们所在的文件：

```bash
$ git config --list --show-origin
```

#### （2）用户信息

安装完 Git 之后，要做的第一件事就是设置你的用户名和邮件地址。 这一点很重要，因为每一个 Git 提交都会使用这些信息，它们会写入到你的每一次提交中，不可更改：

```console
$ git config --global user.name "itnanls"
$ git config --global user.email "510180298@qq.com"
```

再次强调，如果使用了 `--global` 选项，那么该命令只需要运行一次，因为之后无论你在该系统上做任何事情， Git 都会使用那些信息。 当你想针对特定项目使用不同的用户名称与邮件地址时，可以在那个项目目录下运行没有 `--global` 选项的命令来配置。

很多 GUI 工具都会在第一次运行时帮助你配置这些信息。

#### （3）检查配置信息

如果想要检查你的配置，可以使用 `git config --list` 命令来列出所有 Git 当时能找到的配置。

```bash
$ git config --list
user.name=John Doe
user.email=johndoe@example.com
color.status=auto
color.branch=auto
color.interactive=auto
color.diff=auto
...
```

你可能会看到重复的变量名，因为 Git 会从不同的文件中读取同一个配置（例如：`/etc/gitconfig` 与 `~/.gitconfig`）。 这种情况下，Git 会使用它找到的每一个变量的最后一个配置。

你可以通过输入 `git config <key>`： 来检查 Git 的某一项配置

```bash
$ git config user.name
John Doe
```

### 2、基础命令

```bash
// 初始化 仓库
51018@DESKTOP-6R8BLO2 MINGW64 ~/Desktop/git-study
$ git init
Initialized empty Git repository in C:/Users/51018/Desktop/git-study/.git/
51018@DESKTOP-6R8BLO2 MINGW64 ~/Desktop/git-study (master)
    
// 添加一个文件
$ touch a.txt
$ echo 123 > a.txt
51018@DESKTOP-6R8BLO2 MINGW64 ~/Desktop/git-study (master)
    
// 提交至缓存区
$ git add a.txt
51018@DESKTOP-6R8BLO2 MINGW64 ~/Desktop/git-study (master)

// 提交到本地仓库
$ git commit -m 'first'
[master (root-commit) ac41d06] first
 1 file changed, 0 insertions(+), 0 deletions(-)
 create mode 100644 a.txt

51018@DESKTOP-6R8BLO2 MINGW64 ~/Desktop/git-study (master)
```

我们怎么知道哪些文件是新添加的，哪些文件已经加入了暂存区域呢？总不能让我们自己拿个本本记下来吧？ 当然不，作为世界上最伟大的版本控制系统，你能遇到的囧境，Git 早已有了相应的解决方案。随时随地都可以使用**git status**查看当前状态

```bash
$ git status
On branch master
nothing to commit, working tree clean
```

如果代码报错：git上传代码报错-The file will have its original line endings in your working directory

原因是因为文件中换行符的差别导致的。

> 这里需要知道CRLF和LF的区别：

windows下的换行符是CRLF而Unix的换行符格式是LF。git默认支持LF。

上面的报错的意思是会把CRLF（也就是回车换行）转换成Unix格式（LF），这些是转换文件格式的警告，不影响使用。

一般commit代码时git会把CRLF转LF，pull代码时LF换CRLF。

解决方案：

```bash
git rm -r --cached .
git config core.autocrlf false
```

然后重新上传代码即可。

为true时，Git会将你add的所有文件视为文本问价你，将结尾的CRLF转换为LF，而checkout时会再将文件的LF格式转为CRLF格式。

为false时，line endings不做任何改变，文本文件保持其原来的样子。

为input时，add时Git会把CRLF转换为LF，而check时仍旧为LF，所以Windows操作系统不建议设置此值。

> git log 查看历史操作记录

```bash
$ git log
commit 5da78a44017dda030d1fe273e2a470792534ba9a (HEAD -> master)
Author: zhangnan <510180298@qq.com>
Date:   Sat Mar 13 16:01:01 2021 +0800

    123

commit c7c0e3bf6d64404e3e68632c24ca13eac38b02e2
Author: zhangnan <510180298@qq.com>
Date:   Sat Mar 13 15:53:38 2021 +0800

    first

51018@DESKTOP-6R8BLO2 MINGW64 ~/Desktop/git-study (master)
* d5a12d8a966da5bf36c1f4a080c5d507398f5f59 (HEAD -> master) first
```

结果中：有head代表当前所处的分之，master代表当前是master分支。可以按下不表。

两次的提交记录看到了。--pretty=oneline

head git 中的分支，其实本质上仅仅是个指向 commit 对象的可变指针。git 是如何知道你当前在哪个分支上工作的呢？ 其实答案也很简单，它保存着一个名为 HEAD 的特别指针。在 git 中，它是一个指向你正在工作中的本地分支的指针，可以将 HEAD 想象为当前分支的别名。

```bash
$ git log --graph
```

### 3、时光回退

有关回退的命令有两个：**reset 和 checkout**

#### （1）回滚快照

*注：快照即提交的版本，每个版本我们称之为一个快照。*

现在我们利用 reset 命令回滚快照，并看看 Git 仓库和三棵树分别发生了什么。

执行 git reset HEAD~ 命令：

*注：HEAD 表示最新提交的快照，而 HEAD~ 表示 HEAD 的上一个快照，HEAD~~表示上上个快照，如果表示上10个快照，则可以用HEAD ~10*

此时我们的快找回滚到了第二棵数（暂存区域）

记住：head永远指向当前分支的当前快照

```bash
$ git  --hard reset head~

51018@DESKTOP-6R8BLO2 MINGW64 ~/Desktop/git-study (master)
$ git log
commit c7c0e3bf6d64404e3e68632c24ca13eac38b02e2 (HEAD -> master)
Author: zhangnan <510180298@qq.com>
Date:   Sat Mar 13 15:53:38 2021 +0800

    first

51018@DESKTOP-6R8BLO2 MINGW64 ~/Desktop/git-study (master)
```

可以看到，只剩下一个记录了。

![image-20210316212457416](..\img\image-20210316212457416-62bfdc2a.png)

> 参数选择

--hard : 回退版本库，暂存区，工作区。（因此我们修改过的代码就没了，需要谨慎使用）

reset 不仅移动 HEAD 的指向，将快照回滚动到暂存区域，它还将暂存区域的文件还原到工作目录。

--mixed: 回退版本库，暂存区。(--mixed为git reset的默认参数，即当任何参数都不加的时候的参数)

--soft: 回退版本库。

就相当于只移动 HEAD 的指向，但并不会将快照回滚到暂存区域。相当于撤消了上一次的提交（commit）。

![image-20210316214437985](..\img\image-20210316214437985-2956454f.png)

#### **（2）回滚指定快照**

reset 不仅可以回滚指定快照，还可以回滚个别文件。

命令格式为：

```bash
git reset --hard  c7c0e3bf6d64404e3e68632c24ca13eac38b02e2
```

这样，它就会将忽略移动 HEAD 的指向这一步（因为你只是回滚快照的部分内容，并不是整个快照，所以 HEAD 的指向不应该发生改变），直接将指定快照的指定文件回滚到暂存区域。

**不仅可以往回滚，还可以往前滚！**

这里需要强调的是：reset 不仅是一个“复古”的命令，它不仅可以回到过去，还可以去到“未来”。

唯一的一个前提条件是：你需要知道指定快照的 ID 号。

**那如果不小心把命令窗口关了不记得ID号怎么办？** 命令：

```bash
git reflog
```

Git记录的每一次操作的版本ID号

```bash
$ git reset --hard 7ce4954
```

### 4、版本对比

#### （1）暂存区与工作树

目的：对比版本之间有哪些不同

在已经存在的文件b.txt中添加内容：

```bash
$ git diff
diff --git a/b.txt b/b.txt
index 9ab39d5..4d37a8a 100644
--- a/b.txt
+++ b/b.txt
@@ -2,3 +2,4 @@
 1212
 123123123
 234234234
+手动阀手动阀
```

现在来解释一下上面每一行的含义：

**第一行：**diff --git a/b.txt b/b.txt 表示对比的是存放在暂存区域和工作目录的b.txt

**第二行：**index 9ab39d5..4d37a8a 100644 表示对应文件的 ID 分别是 9ab39d5和 4d37a8a，左边暂存区域，后边当前目录。最后的 100644 是指定文件的类型和权限

**第三行：**--- a/b.txt

--- 表示该文件是旧文件（存放在暂存区域）

**第四行：**+++ b/b.txt +++ 表示该文件是新文件（存放在工作区域）

**第五行：**@@ -2,3 +2,4 @@ 以 @@ 开头和结束，中间的“-”表示旧文件，“+”表示新文件，后边的数字表示“开始行号，显示行数”

内容：+代表新增的行 -代表少了的行

直接执行 git diff 命令是比较暂存区域与工作目录的文件内容：

#### （2）工作树和最新提交

```text
$ git diff head
warning: LF will be replaced by CRLF in b.txt.
The file will have its original line endings in your working directory
diff --git a/b.txt b/b.txt
new file mode 100644
index 0000000..4d37a8a
--- /dev/null
+++ b/b.txt
@@ -0,0 +1,5 @@
+123
+1212
+123123123
+234234234
+手动阀手动阀

51018@DESKTOP-6R8BLO2 MINGW64 ~/Desktop/git-study (master)
```

#### （3）两个历史快照

```bash
$ git diff 5da78a4 c7c0e3b
diff --git a/b.txt b/b.txt
deleted file mode 100644
index 81c545e..0000000
--- a/b.txt
+++ /dev/null
@@ -1 +0,0 @@
-1234
```

#### （4）比较仓库和暂存区

```bash
$ git diff --cached c7c0e3b
diff --git a/b.txt b/b.txt
new file mode 100644
index 0000000..9ab39d5
--- /dev/null
+++ b/b.txt
@@ -0,0 +1,4 @@
+123
+1212
+123123123
+234234234
```

### 5、删除文件

> 不小心删除文件怎么办？

现在从工作目录中手动删除 b.txt 文件，然后执行 git status 命令：

```bash
$ git status
On branch master
Changes not staged for commit:
  (use "git add/rm <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

        deleted:    b.txt

no changes added to commit (use "git add" and/or "git commit -a")
```

提醒使用 checkout 命令可以将暂存区域的文件恢复到工作目录：

```bash
$ git checkout -- b.txt
```

文件就会重新返回。

> 那么如何彻底删除一个文件呢？

假如你不小心把小黄图下载到了工作目录，然后又不小心提交到了 Git 仓库：

新增一个c.txt文件

```text
51018@DESKTOP-6R8BLO2 MINGW64 ~/Desktop/git-study (master)
$ echo 123 > c.txt

51018@DESKTOP-6R8BLO2 MINGW64 ~/Desktop/git-study (master)
$ git add .
51018@DESKTOP-6R8BLO2 MINGW64 ~/Desktop/git-study (master)
$ git commit -m 'third'
[master 3bd84d8] third
 1 file changed, 1 insertion(+)
 create mode 100644 c.txt
```

还有方法：

执行 git rm a.txt 命令：

```text
$ git rm c.txt
rm 'c.txt'
```

此时工作目录中的c.txt已经被删除……

```bash
51018@DESKTOP-6R8BLO2 MINGW64 ~/Desktop/git-study (master)
$ ls
a.txt  b.txt  mintty.exe.stackdump
```

但执行 git status 命令，你仍然发现 Git 还不肯松手：

```bash
$ git status
On branch master
Changes to be committed:
  (use "git reset HEAD <file>..." to unstage)

        deleted:    c.txt
```

意思是说它在仓库的快照中发现有个叫 c.txt 的东西，但似乎在暂存区域和当前目录不见了！

此时可以执行 git reset --soft HEAD~ 命令将快照回滚到上一个位置，然后重新提交，就好了：

**注意：rm 命令删除的只是工作目录和暂存区域的文件（即取消跟踪，在下次提交时不纳入版本管理）**

> 缓冲区和工作树的内容不一致，怎么删除

1、修改b.txt 添加至缓冲区

2、再修改b.txt

3、git rm c.txt

```bash
$ echo 123 > b.txt

51018@DESKTOP-6R8BLO2 MINGW64 ~/Desktop/git-study (master)
$ git add b.txt

51018@DESKTOP-6R8BLO2 MINGW64 ~/Desktop/git-study (master)
$ echo 123 > b.txt

51018@DESKTOP-6R8BLO2 MINGW64 ~/Desktop/git-study (master)
$ git rm b.txt
error: the following file has changes staged in the index:
    b.txt
(use --cached to keep the file, or -f to force removal)
```

因为两个不同内容的同名文件，谁知道你是不是搞清楚了都要删掉？还是提醒一下好，别等一下出错了又要赖机器…… 根据提示，执行 git rm -f b.txt命令就可以把两个都删除。

> 我只想删除暂存区域的文件，保留工作目录的，应该怎么操作？

执行 git rm --cached 文件名 命令。

### 6、重命名文件

直接在工作目录重命名文件，执行git status出现错误：

```bash
$ git status
On branch master
Changes to be committed:
  (use "git reset HEAD <file>..." to unstage)

        modified:   b.txt

Changes not staged for commit:
  (use "git add/rm <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

        deleted:    b.txt

Untracked files:
  (use "git add <file>..." to include in what will be committed)

        n.txt
```

正确的姿势应该是：

git mv 旧文件名 新文件名

```bash
$ git mv b.txt c.txt

51018@DESKTOP-6R8BLO2 MINGW64 ~/Desktop/git-study (master)
$ git status
On branch master
Changes to be committed:
  (use "git reset HEAD <file>..." to unstage)

        renamed:    b.txt -> c.txt
```

### 7、忽略文件

**如何让Git 识别某些格式的文件，然后自主不跟踪它们？** 比如工作目录中有三个文件1.temp、2.temp 和 3.temp，我们不希望后缀名为 temp 的文件被追踪，可是每次执行git status都会出现：

解决办法：在工作目录创建一个名为 .gitignore 的文件。

然后你发现 Windows 压根儿不允许你在文件管理器中创建以点（.）开头的文件。windows需要在命令行窗口创建（.）开头的文件。执行 echo *.temp > .gitignore 命令，创建一个 .gitignore 文件，并让 Git 忽略所有 .temp 后缀的文件：

```bash
$ echo *.temp > .gitignore
$ echo *.temp > .gitignore
```

在工作目录创建 a.temp

```bash
$ git status
On branch master
Changes to be committed:
  (use "git reset HEAD <file>..." to unstage)

        renamed:    b.txt -> c.txt

Untracked files:
  (use "git add <file>..." to include in what will be committed)

        .gitignore


51018@DESKTOP-6R8BLO2 MINGW64 ~/Desktop/git-study (master)
```

好了，Git 已经忽略了所有的 *.temp 文件（你还可以把 .gitignore 文件也一并忽略）。

### 8、创建和切换分支

#### （1）分支是什么？

假设你的大项目已经上线了（有上百万人在使用），过了一段时间

你突然觉得应该添加一些新的功能，但是为了保险起见，你肯定不能在当前项目上直接进行开发，这时候你就有创建分支的需要了。

![image-20210316221252036](..\img\image-20210316221252036-21f2b3f7.png)

对于其它版本控制系统而言，创建分支常常需要完全创建一个源代码目录的副本，项目越大，耗费的时间就越多；而 Git 由于每一个结点都已经是一个完整的项目，所以只需要创建多一个“指针”（像 master）指向分支开始的位置即可。

#### （2）创建分支

创建分支，使用 git branch 分支名 命令：

```bash
$ git branch feature01
```

#### （3）切换分支

现在我们需要将工作环境切换到新创建的分支（feature）上，使用的就是之前我们欲言又止的 checkout 命令。执行 git checkout feature 命令：

```bash
$ git checkout feature01
Switched to branch 'feature01'
```

### 9、合并分支

先切换（checkout）到相对的主分支（develop）然后执行 git merge feature01命令，将 feature 分支合并到 HEAD 所在的分支（develop）上：

### 10、删除分支

当一个功能开发完成，并且成功合并到主分支，我们应该删除分支

使用 git branch -d 分支名 命令：

### 11、变基

当我们开发一个功能时，可能会在本地有无数次commit，而你实际上在你的master分支上只想显示每一个功能测试完成后的一次完整提交记录就好了，其他的提交记录并不想将来全部保留在你的master分支上，那么rebase将会是一个好的选择，他可以在rebase时将本地多次的commit合并成一个commit，还可以修改commit的描述等

```text
// 合并前两次的commit
git  rebase -i head~~

// 合并此次commit在最新commit的提交
git rebaser -i hash值
```

## 完整流程

![image-20210318143710841](..\img\image-20210318143710841-89588c83.png)

```bash
#=======================
# 拉代码，开分支
git clone
git checkout develop
git branch xxx
#=======================
# 写代码，提交
===写代码===
git add xxx
git commit -m 'xxx'
#=======================
# 合并到develop
git checkout develop
git merge xxx
# 删除分支
git branch -d xxx
#========================
# 推到托管平台，先拉，解决冲突
git pull
git push
#========================
```

- 不要随便动别人的代码，即使要动也要商量！
- 不要随便动别人的代码，即使要动也要商量！
- 不要随便动别人的代码，即使要动也要商量！
- 记住一点，写代码和提交之前先拉去最新的代码！必须记住！
- 记住一点，写代和提交之码前先拉去最新的代码！必须记住！
- 记住一点，写代和提交之码前先拉去最新的代码！必须记住！

能够很大程度的避免冲突！