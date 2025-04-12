### Linux读取环境变量

读取环境变量的方法：

- `export`命令显示当前系统定义的所有环境变量
- `echo $PATH`命令输出当前的`PATH`环境变量的值

这两个命令执行的效果如下

```shell
uusama@ubuntu:~$ export
declare -x HOME="/home/uusama"
declare -x LANG="en_US.UTF-8"
declare -x LANGUAGE="en_US:"
declare -x LESSCLOSE="/usr/bin/lesspipe %s %s"
declare -x LESSOPEN="| /usr/bin/lesspipe %s"
declare -x LOGNAME="uusama"
declare -x MAIL="/var/mail/uusama"
declare -x PATH="/home/uusama/bin:/home/uusama/.local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
declare -x SSH_TTY="/dev/pts/0"
declare -x TERM="xterm"
declare -x USER="uusama"

uusama@ubuntu:~$ echo $PATH
/home/uusama/bin:/home/uusama/.local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
```

其中`PATH`变量定义了运行命令的查找路径，以冒号`:`分割不同的路径，使用`export`定义的时候可加双引号也可不加。

### Linux环境变量配置方法一：`export PATH`

使用`export`命令直接修改`PATH`的值，配置MySQL进入环境变量的方法:

```shell
export PATH=/home/uusama/mysql/bin:$PATH

# 或者把PATH放在前面
export PATH=$PATH:/home/uusama/mysql/bin
```

注意事项：

- 生效时间：立即生效
- 生效期限：当前终端有效，窗口关闭后无效
- 生效范围：仅对当前用户有效
- 配置的环境变量中不要忘了加上原来的配置，即`$PATH`部分，避免覆盖原来配置

### Linux环境变量配置方法二：`vim ~/.bashrc`

通过修改用户目录下的`~/.bashrc`文件进行配置：

```shell
vim ~/.bashrc

# 在最后一行加上
export PATH=$PATH:/home/uusama/mysql/bin
```

注意事项：

- 生效时间：使用相同的用户打开新的终端时生效，或者手动`source ~/.bashrc`生效
- 生效期限：永久有效
- 生效范围：仅对当前用户有效
- 如果有后续的环境变量加载文件覆盖了`PATH`定义，则可能不生效

### Linux环境变量配置方法三：`vim ~/.bash_profile`

和修改`~/.bashrc`文件类似，也是要在文件最后加上新的路径即可：

```shell
vim ~/.bash_profile

# 在最后一行加上
export PATH=$PATH:/home/uusama/mysql/bin
```

注意事项：

- 生效时间：使用相同的用户打开新的终端时生效，或者手动`source ~/.bash_profile`生效
- 生效期限：永久有效
- 生效范围：仅对当前用户有效
- 如果没有`~/.bash_profile`文件，则可以编辑`~/.profile`文件或者新建一个

### Linux环境变量配置方法四：`vim /etc/bashrc`

该方法是修改系统配置，需要管理员权限（如root）或者对该文件的写入权限：

```shell
# 如果/etc/bashrc文件不可编辑，需要修改为可编辑
chmod -v u+w /etc/bashrc

vim /etc/bashrc

# 在最后一行加上
export PATH=$PATH:/home/uusama/mysql/bin
```

注意事项：

- 生效时间：新开终端生效，或者手动`source /etc/bashrc`生效
- 生效期限：永久有效
- 生效范围：对所有用户有效

### Linux环境变量配置方法五：`vim /etc/profile`

该方法修改系统配置，需要管理员权限或者对该文件的写入权限，和`vim /etc/bashrc`类似：

```shell
# 如果/etc/profile文件不可编辑，需要修改为可编辑
chmod -v u+w /etc/profile

vim /etc/profile

# 在最后一行加上
export PATH=$PATH:/home/uusama/mysql/bin
```

注意事项：

- 生效时间：新开终端生效，或者手动`source /etc/profile`生效
- 生效期限：永久有效
- 生效范围：对所有用户有效

### Linux环境变量配置方法六：`vim /etc/environment`

该方法是修改系统环境配置文件，需要管理员权限或者对该文件的写入权限：

```shell
# 如果/etc/bashrc文件不可编辑，需要修改为可编辑
chmod -v u+w /etc/environment

vim /etc/profile

# 在最后一行加上
export PATH=$PATH:/home/uusama/mysql/bin
```

注意事项：

- 生效时间：新开终端生效，或者手动`source /etc/environment`生效
- 生效期限：永久有效
- 生效范围：对所有用户有效

### Linux环境变量加载顺序的方法

可以推测出Linux加载环境变量的顺序如下：

1. `/etc/environment`
2. `/etc/profile`
3. `/etc/bash.bashrc`
4. `/etc/profile.d/test.sh`
5. `~/.profile`
6. `~/.bashrc`
