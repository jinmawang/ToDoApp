# 前端开发者运维基础知识入门

> 🎯 **目标读者**：前端开发者，对 Linux、服务器、运维概念不熟悉
> 📚 **学习目标**：理解服务器、操作系统、镜像等基础概念，为部署做好准备

---

## 📚 目录

- [第 1 章：核心概念](#第-1-章核心概念)
- [第 2 章：Linux 基础](#第-2-章linux-基础)
- [第 3 章：命令行入门](#第-3-章命令行入门)
- [第 4 章：文件系统](#第-4-章文件系统)
- [第 5 章：权限管理](#第-5-章权限管理)
- [第 6 章：进程管理](#第-6-章进程管理)
- [第 7 章：网络基础](#第-7-章网络基础)
- [附录：常用命令速查](#附录常用命令速查)

---

## 第 1 章：核心概念

### 1.1 什么是服务器？

**服务器 = 一台永不关机的电脑**

```
你的笔记本：
- 用途：开发、浏览网页、看视频、玩游戏
- 使用：有屏幕、鼠标、键盘，你坐在前面操作
- 运行时间：你用的时候才开机

服务器：
- 用途：运行网站、API、数据库等服务
- 使用：没有屏幕，通过网络远程连接
- 运行时间：24小时×365天永远开机
```

**前端类比：**
```
你的笔记本 = 开发环境（npm run dev）
服务器 = 生产环境（npm run build + 部署）
```

### 1.2 什么是云服务器？

**云服务器 = 你在数据中心租的电脑**

```
传统方式：
你买一台物理服务器 → 放在自己公司机房 → 自己维护硬件

云服务器：
你租一台虚拟服务器 → 放在云服务商机房 → 云服务商维护硬件
```

**类比：**
```
买房 vs 租房
- 买房：一次性花大钱，自己维护
- 租房：按月付费，房东维护

自建服务器 vs 云服务器
- 自建：买硬件（几万元），自己维护（电费、空调、网费）
- 云服务器：租用（50元/月），云服务商维护
```

### 1.3 什么是操作系统？

**操作系统 = 电脑的"大管家"**

```
硬件（CPU、内存、硬盘）
      ↓
操作系统（Windows/macOS/Linux）
      ↓
应用程序（Chrome、VS Code、你的代码）
```

**前端类比：**
```
硬件 = 浏览器引擎（V8）
操作系统 = Node.js runtime
应用程序 = 你的 JavaScript 代码
```

**常见操作系统：**

| 操作系统 | 用途 | 界面 | 常用场景 |
|---------|-----|------|---------|
| **Windows** | 个人电脑 | 图形界面 | 办公、游戏 |
| **macOS** | 苹果电脑 | 图形界面 | 开发、设计 |
| **Linux** | 服务器 | 命令行 | Web服务、数据库 |

**为什么服务器用 Linux？**
- ✅ 免费开源
- ✅ 稳定（可以运行几年不重启）
- ✅ 安全
- ✅ 资源占用少（没有图形界面）
- ✅ 社区支持好，教程多

### 1.4 什么是 Linux 发行版？

**Linux 发行版 = 不同"口味"的 Linux**

```
Linux 内核（核心）
    ↓
不同的"包装"（发行版）
    ├── Ubuntu（最流行，适合新手）
    ├── CentOS（企业常用）
    ├── Debian（Ubuntu 的"祖先"）
    └── Arch（极客专用）
```

**前端类比：**
```
JavaScript 引擎 = Linux 内核
    ↓
不同的 Runtime = 不同的发行版
    ├── Node.js（最流行）
    ├── Deno（新选择）
    └── Bun（最快）
```

**Ubuntu 的优势：**
- ✅ 最适合新手（类似于"React 是最流行的前端框架"）
- ✅ 教程最多（遇到问题搜索容易找到答案）
- ✅ 软件包丰富（apt install 就像 npm install）
- ✅ 长期支持版本（LTS = Long Term Support，类似于 Node.js LTS）

### 1.5 什么是镜像（Image）？

#### 概念 1：操作系统镜像

**镜像 = 操作系统的"安装包"**

```
买云服务器时选择镜像 = 给新电脑装系统

选项：
├── Ubuntu 22.04（操作系统镜像）
├── CentOS 7.9（操作系统镜像）
├── Windows Server（操作系统镜像）
└── WordPress（应用镜像 = Ubuntu + Nginx + MySQL + WordPress）
```

**前端类比：**
```
操作系统镜像 = 脚手架模板
- create-react-app（纯净的 React 项目）
- Next.js starter（React + 路由 + SSR）
- Vue CLI（纯净的 Vue 项目）

应用镜像 = 完整的项目模板
- 包含了框架 + 库 + 配置 + 示例代码
```

#### 概念 2：Docker 镜像

**Docker 镜像 = 应用的"安装包"**

```
操作系统镜像（Ubuntu）= 装系统
    ↓
Docker 镜像（node:20）= 装应用
```

**重要区别：**

| 特性 | 操作系统镜像 | Docker 镜像 |
|-----|------------|------------|
| **用途** | 给服务器装系统 | 给应用打包 |
| **时机** | 买服务器时选择，只装一次 | 部署应用时使用，可以装多个 |
| **层级** | 底层（系统级别） | 上层（应用级别） |
| **类比** | 装 Windows 系统 | 装 Chrome 浏览器 |

### 1.6 Linux 服务器 vs Ubuntu 镜像的关系

**完整流程：**

```
第1步：购买云服务器
├── 选择配置：2核2G
├── 选择地域：香港
└── 选择镜像：Ubuntu 22.04 ← 这是操作系统镜像
         ↓
第2步：服务器创建完成
├── 硬件：2核CPU + 2G内存 + 40G硬盘
├── 系统：Ubuntu 22.04 已经装好
└── 网络：公网IP + SSH端口22
         ↓
第3步：连接服务器
├── ssh root@公网IP
└── 看到命令行提示符：root@ubuntu:~#
         ↓
第4步：安装软件
├── apt install docker（装 Docker）
├── apt install nginx（装 Nginx）
└── docker pull node:20（拉取 Docker 镜像）
```

**关系图：**

```
┌─────────────────────────────────────┐
│      云服务器（物理硬件）              │
│  ┌─────────────────────────────┐   │
│  │ Ubuntu 22.04（操作系统）      │   │ ← 操作系统镜像装进来的
│  │  ┌─────────────────────┐    │   │
│  │  │ Docker（软件）        │    │   │ ← apt install 装的
│  │  │  ┌──────────────┐   │    │   │
│  │  │  │ node:20      │   │    │   │ ← Docker 镜像
│  │  │  │ (Docker镜像)  │   │    │   │
│  │  │  └──────────────┘   │    │   │
│  │  └─────────────────────┘    │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**类比：**

```
云服务器 = 一块空地
    ↓
装 Ubuntu 镜像 = 在空地上建房子
    ↓
安装 Docker = 在房子里放家具
    ↓
拉取 Docker 镜像 = 在家具上摆装饰品
```

---

## 第 2 章：Linux 基础

### 2.1 Linux vs Windows vs macOS

#### 界面对比

**Windows/macOS：图形界面（GUI）**
```
你看到的：
- 桌面
- 窗口
- 鼠标点击
- 图标

操作方式：
- 双击打开文件
- 右键菜单
- 拖拽文件
```

**Linux 服务器：命令行界面（CLI）**
```
你看到的：
root@ubuntu:~#           ← 光标在这里闪烁
│     │    │
│     │    └── 当前目录（~ 表示 home 目录）
│     └── 主机名
└── 当前用户

操作方式：
- 输入命令
- 敲回车执行
- 看文字输出
```

**前端类比：**
```
图形界面 = 浏览器开发者工具（点点点）
命令行界面 = Node.js REPL（输入命令）

Windows 文件管理器 = VS Code 文件浏览器
Linux 命令行 = VS Code 终端
```

### 2.2 为什么服务器没有图形界面？

**原因：**

1. **省资源**
   ```
   图形界面：需要 1-2GB 内存
   命令行：只需要 10-20MB 内存

   服务器配置：2GB 内存
   - 装图形界面：一半内存被占用
   - 只用命令行：几乎所有内存给应用用
   ```

2. **更安全**
   ```
   图形界面：有很多软件，漏洞多
   命令行：只装必要软件，攻击面小
   ```

3. **更稳定**
   ```
   图形界面：软件可能崩溃
   命令行：几乎不会崩溃
   ```

4. **远程连接更快**
   ```
   图形界面：需要传输图像（网速要求高）
   命令行：只传输文字（网速要求低）
   ```

### 2.3 Linux 目录结构

**Windows 的目录结构：**
```
C:\
├── Program Files\        （软件安装目录）
├── Users\               （用户文件）
│   └── 你的用户名\
│       ├── Desktop\     （桌面）
│       └── Documents\   （我的文档）
└── Windows\             （系统文件）
```

**Linux 的目录结构：**
```
/                        （根目录，相当于 C:\）
├── home/               （用户主目录，相当于 C:\Users\）
│   └── deploy/        （你创建的用户）
├── root/              （root 用户的主目录）
├── etc/               （配置文件目录）
│   └── nginx/        （Nginx 配置文件）
├── var/               （可变数据）
│   ├── log/          （日志文件）
│   └── www/          （网站文件）
├── usr/               （用户程序）
│   └── bin/          （可执行程序，类似 Program Files）
├── tmp/               （临时文件）
└── opt/               （第三方软件）
```

**重要目录说明：**

| 目录 | Windows 类比 | 用途 | 例子 |
|-----|------------|------|------|
| `/home/用户名` | `C:\Users\你的用户名` | 用户文件 | 你的项目代码 |
| `/root` | `C:\Users\Administrator` | 管理员的家 | root 用户的文件 |
| `/etc` | `C:\Windows\System32\config` | 配置文件 | nginx.conf |
| `/var/log` | `C:\Windows\Logs` | 日志文件 | nginx 日志 |
| `/usr/bin` | `C:\Program Files` | 程序文件 | docker, git |
| `/tmp` | `C:\Temp` | 临时文件 | 临时下载的文件 |

**前端类比：**
```
Linux 文件系统 = npm 项目结构
/                    项目根目录
├── node_modules/    /usr（程序目录）
├── src/             /home（用户文件）
├── package.json     /etc（配置文件）
└── .git/            /var（可变数据）
```

### 2.4 路径表示

**绝对路径 vs 相对路径**

```bash
# 绝对路径（从根目录开始）
/home/deploy/nestjs/backend/src/main.ts
│
└── 从根目录 / 开始的完整路径

# 相对路径（从当前目录开始）
cd /home/deploy/nestjs
cd backend              # 相对路径
cd ./backend            # 也是相对路径（./ 表示当前目录）
cd ../frontend          # ../表示上一级目录
```

**特殊符号：**

| 符号 | 含义 | 前端类比 |
|-----|------|---------|
| `/` | 根目录 | 项目根目录 |
| `~` | 当前用户的 home 目录 | `~/` |
| `.` | 当前目录 | `./` |
| `..` | 上一级目录 | `../` |

**示例：**
```bash
# 你在 /home/deploy/nestjs/backend
pwd                     # 显示当前路径
cd ~                    # 回到 /home/deploy
cd ~/nestjs             # 去 /home/deploy/nestjs
cd ./frontend           # 去 /home/deploy/nestjs/frontend
cd ../backend           # 去 /home/deploy/nestjs/backend
cd /etc/nginx           # 绝对路径，去 Nginx 配置目录
```

---

## 第 3 章：命令行入门

### 3.1 命令行基本结构

**命令的组成：**

```bash
command -options arguments
│       │        │
│       │        └── 参数（要操作的对象）
│       └── 选项（怎么操作）
└── 命令（做什么）
```

**例子：**
```bash
ls -la /home/deploy
│  │   │
│  │   └── 参数：列出哪个目录
│  └── 选项：-l（详细信息），-a（包括隐藏文件）
└── 命令：列出文件

npm install --save-dev webpack
│   │       │          │
│   │       │          └── 参数
│   │       └── 选项
│   └── 子命令
└── 命令
```

### 3.2 文件操作命令

#### ls - 列出文件（类似 dir）

```bash
# 基本用法
ls                      # 列出当前目录
ls /home               # 列出指定目录

# 常用选项
ls -l                  # 详细信息（文件大小、权限、修改时间）
ls -a                  # 显示隐藏文件（.开头的文件）
ls -la                 # 组合：详细信息 + 隐藏文件
ls -lh                 # h = human readable（文件大小显示为 KB/MB）
ls -lt                 # 按时间排序
ls -ltr                # 按时间倒序（最新的在最下面）

# 前端类比
ls = 文件资源管理器的"列表视图"
ls -la = 显示所有文件（包括 .git、.env 等）
```

**输出示例：**
```bash
$ ls -lh
总用量 12K
drwxr-xr-x 5 deploy deploy 4.0K 2月  5 10:30 backend
drwxr-xr-x 8 deploy deploy 4.0K 2月  5 10:30 frontend
-rw-r--r-- 1 deploy deploy 1.2K 2月  5 10:30 docker-compose.yml
│          │ │      │      │    │           │
│          │ │      │      │    │           └── 文件名
│          │ │      │      │    └── 修改时间
│          │ │      │      └── 文件大小
│          │ │      └── 所属组
│          │ └── 所有者
│          └── 硬链接数
└── 权限（后面详细讲）
```

#### cd - 切换目录（类似 cd）

```bash
cd /home/deploy        # 去指定目录（绝对路径）
cd backend             # 去子目录（相对路径）
cd ..                  # 去上一级目录
cd ~                   # 回到 home 目录
cd -                   # 回到上一次所在的目录（很有用！）

# 前端类比
cd = VS Code 中切换工作目录
cd .. = 点击面包屑导航的上一级
```

#### pwd - 显示当前目录（Print Working Directory）

```bash
pwd
# 输出：/home/deploy/nestjs/backend

# 前端类比
pwd = VS Code 底部状态栏显示的当前文件路径
pwd = __dirname（Node.js 中获取当前目录）
```

#### mkdir - 创建目录（类似 md）

```bash
mkdir mydir            # 创建目录
mkdir -p a/b/c        # 递归创建（如果 a、b 不存在，自动创建）

# 前端类比
mkdir = 右键 → 新建文件夹
mkdir -p = mkdirp（npm 包）
```

#### touch - 创建空文件

```bash
touch index.js         # 创建空文件
touch a.txt b.txt     # 创建多个文件

# 前端类比
touch = 右键 → 新建文件
touch = fs.writeFileSync('file.txt', '')
```

#### cp - 复制文件/目录（类似 copy）

```bash
cp file.txt backup.txt           # 复制文件
cp -r dir1 dir2                  # 复制目录（-r = recursive）
cp file.txt /home/deploy/        # 复制到指定目录

# 前端类比
cp = Ctrl+C → Ctrl+V
cp -r = 复制整个文件夹
```

#### mv - 移动/重命名（类似 move/ren）

```bash
mv old.txt new.txt               # 重命名
mv file.txt /tmp/                # 移动文件
mv dir1 dir2                     # 移动目录

# 前端类比
mv = 拖拽文件到另一个文件夹
mv old.txt new.txt = 重命名文件（F2）
```

#### rm - 删除文件/目录（类似 del）

```bash
rm file.txt            # 删除文件
rm -r dir              # 删除目录（-r = recursive）
rm -rf dir             # 强制删除（-f = force，不询问）

# ⚠️ 危险命令警告
rm -rf /               # 删除整个系统（千万别执行！）
rm -rf *               # 删除当前目录所有文件（小心！）

# 前端类比
rm = Delete 键
rm -rf = Shift+Delete（永久删除，不进回收站）
rm -rf node_modules = 删除依赖（常用）
```

### 3.3 查看文件内容

#### cat - 查看文件内容（类似 type）

```bash
cat file.txt           # 显示文件内容
cat -n file.txt        # 显示行号

# 前端类比
cat = console.log(fs.readFileSync('file.txt'))
cat = 直接打开文件看内容
```

#### less - 分页查看（可上下滚动）

```bash
less file.txt          # 打开文件

# 操作：
# 空格：下一页
# b：上一页
# /keyword：搜索
# q：退出

# 前端类比
less = VS Code 的文件查看器
less = 浏览器的滚动条
```

#### head - 查看文件开头

```bash
head file.txt          # 显示前 10 行
head -n 20 file.txt    # 显示前 20 行

# 前端类比
head = arr.slice(0, 10)
```

#### tail - 查看文件结尾

```bash
tail file.txt          # 显示最后 10 行
tail -n 20 file.txt    # 显示最后 20 行
tail -f file.txt       # 实时查看（新内容自动显示）← 常用！

# 查看日志常用
tail -f /var/log/nginx/access.log

# 前端类比
tail = arr.slice(-10)
tail -f = 实时查看 console.log 输出
```

### 3.4 搜索和过滤

#### grep - 搜索文本（类似 findstr）

```bash
grep "error" file.txt              # 在文件中搜索 "error"
grep -i "error" file.txt           # 不区分大小写
grep -r "TODO" ./src               # 递归搜索目录
grep -n "error" file.txt           # 显示行号

# 常用场景：查看日志中的错误
docker logs backend | grep -i error

# 前端类比
grep = Ctrl+F（查找）
grep -r = VS Code 的全局搜索（Ctrl+Shift+F）
grep = str.includes('error')
```

#### find - 查找文件（类似 dir /s）

```bash
find . -name "*.js"                # 查找所有 .js 文件
find /home -name "package.json"    # 查找 package.json
find . -type d -name "node_modules" # 查找名为 node_modules 的目录

# 前端类比
find = VS Code 的文件搜索（Ctrl+P）
find . -name "*.js" = glob 模式匹配
```

### 3.5 管道和重定向

#### 管道（|）- 连接命令

```bash
# 管道：把第一个命令的输出传给第二个命令

ls -l | grep ".js"             # 列出文件，然后过滤 .js 文件
cat file.txt | grep "error"    # 查看文件，然后搜索 error
docker logs backend | tail -f  # 查看日志的最后几行

# 前端类比
管道 = 函数组合
ls | grep = arr.filter(item => item.includes('.js'))
```

#### 重定向（>、>>）- 保存输出

```bash
# > 覆盖文件
echo "Hello" > file.txt        # 把 "Hello" 写入 file.txt（覆盖）
ls > filelist.txt              # 把文件列表保存到文件

# >> 追加到文件
echo "World" >> file.txt       # 追加到 file.txt（不覆盖）

# 前端类比
> = fs.writeFileSync('file.txt', data)
>> = fs.appendFileSync('file.txt', data)
```

### 3.6 实用技巧

#### 命令历史

```bash
history                # 查看命令历史
!123                   # 执行第 123 条历史命令
!!                     # 执行上一条命令
!grep                  # 执行最近一条以 grep 开头的命令

# 快捷键
↑                      # 上一条命令
Ctrl+R                 # 搜索历史命令（超好用！）
```

#### Tab 自动补全

```bash
# 输入部分命令，按 Tab 自动补全
cd /ho[Tab]            # 自动补全为 cd /home/
ls doc[Tab]            # 自动补全为 ls docker-compose.yml
```

#### 快捷键

| 快捷键 | 作用 | 前端类比 |
|-------|------|---------|
| `Ctrl+C` | 终止当前命令 | 终端中的停止按钮 |
| `Ctrl+D` | 退出当前 shell | 关闭终端 |
| `Ctrl+L` | 清屏 | `clear` 命令 |
| `Ctrl+A` | 光标移到行首 | Home 键 |
| `Ctrl+E` | 光标移到行尾 | End 键 |
| `Ctrl+U` | 删除光标前的内容 | 全选删除 |
| `Ctrl+K` | 删除光标后的内容 | - |
| `Ctrl+R` | 搜索历史命令 | Ctrl+F |

---

## 第 4 章：文件系统

### 4.1 文件类型

**Linux 中一切皆文件**

```
- = 普通文件（.txt, .js, .json）
d = 目录（directory）
l = 符号链接（symbolic link，类似快捷方式）
```

**查看文件类型：**
```bash
$ ls -l
-rw-r--r-- 1 deploy deploy 1234 2月  5 10:30 file.txt
│
└── - 表示普通文件

drwxr-xr-x 5 deploy deploy 4096 2月  5 10:30 backend
│
└── d 表示目录

lrwxrwxrwx 1 deploy deploy   10 2月  5 10:30 link -> file.txt
│
└── l 表示符号链接
```

### 4.2 符号链接（软链接）

**符号链接 = Windows 的快捷方式**

```bash
# 创建符号链接
ln -s /path/to/file linkname

# 实际例子
ln -s /etc/nginx/sites-available/todo-app /etc/nginx/sites-enabled/todo-app
      │                                    │
      └── 原始文件                          └── 链接名

# 前端类比
ln -s = npm link（创建包的符号链接）
ln -s = VS Code 的 alias 路径（@ 符号）
```

**为什么要用符号链接？**
```
Nginx 配置文件：
/etc/nginx/sites-available/    ← 所有配置文件存这里
/etc/nginx/sites-enabled/      ← 只放"启用"的配置（符号链接）

好处：
- 禁用配置：删除链接，不删除原文件
- 启用配置：创建链接
- 类似于 VS Code 的扩展：全部装了，但只启用部分
```

### 4.3 隐藏文件

**以 . 开头的文件 = 隐藏文件**

```bash
.bashrc                # Bash 配置文件
.gitignore            # Git 忽略文件
.env                  # 环境变量文件
.ssh/                 # SSH 密钥目录

# 查看隐藏文件
ls -a                 # a = all（包括隐藏文件）

# 前端类比
.gitignore = Git 忽略文件
.env = 环境变量文件
.vscode/ = VS Code 配置
```

### 4.4 文件权限

**权限表示：**

```bash
-rw-r--r-- 1 deploy deploy 1234 2月  5 10:30 file.txt
│││││││││
││││││││└── 其他用户权限（r--：只读）
│││││└──── 同组用户权限（r--：只读）
││└────── 文件所有者权限（rw-：读写）
│└─────── 文件类型（-：普通文件）
└──────── 权限位
```

**权限详解：**

| 权限 | 字母 | 数字 | 对文件的含义 | 对目录的含义 |
|-----|-----|------|------------|------------|
| 读 | `r` | 4 | 可以查看文件内容 | 可以列出目录内容（ls） |
| 写 | `w` | 2 | 可以修改文件内容 | 可以在目录中创建/删除文件 |
| 执行 | `x` | 1 | 可以执行文件（脚本、程序） | 可以进入目录（cd） |
| 无 | `-` | 0 | 无权限 | 无权限 |

**权限组合：**

```
rwx = 7 (4+2+1) = 读+写+执行
rw- = 6 (4+2)   = 读+写
r-x = 5 (4+1)   = 读+执行
r-- = 4         = 只读
--- = 0         = 无权限
```

**常见权限示例：**

```bash
-rw-r--r-- 644 file.txt        # 所有者可读写，其他人只读
-rwxr-xr-x 755 script.sh       # 所有者全权限，其他人可读可执行
-rw------- 600 .env            # 只有所有者可读写（私密文件）
drwxr-xr-x 755 directory/      # 目录：所有者全权限，其他人可读可进入
```

---

## 第 5 章：权限管理

### 5.1 修改权限（chmod）

#### 使用数字

```bash
chmod 644 file.txt             # 设置为 rw-r--r--
chmod 755 script.sh            # 设置为 rwxr-xr-x
chmod 600 .env                 # 设置为 rw-------

# 前端类比
chmod = 右键 → 属性 → 安全
chmod = fs.chmodSync('file.txt', 0o644)
```

#### 使用字母

```bash
chmod u+x script.sh            # 给所有者添加执行权限（u=user）
chmod g+w file.txt             # 给同组用户添加写权限（g=group）
chmod o-r file.txt             # 移除其他用户的读权限（o=others）
chmod a+x script.sh            # 给所有人添加执行权限（a=all）

# u = user（所有者）
# g = group（同组用户）
# o = others（其他用户）
# a = all（所有人）

# + = 添加权限
# - = 移除权限
# = = 设置权限
```

#### 递归修改

```bash
chmod -R 755 directory/        # 递归修改目录及其所有内容
```

### 5.2 修改所有者（chown）

```bash
chown deploy file.txt          # 改变所有者
chown deploy:deploy file.txt   # 改变所有者和组
chown -R deploy:deploy dir/    # 递归改变

# 常见场景：修复权限问题
sudo chown -R $USER:$USER ~/nestjs
```

### 5.3 sudo - 以管理员身份执行

**sudo = Windows 的"以管理员身份运行"**

```bash
# 普通命令（没有权限）
apt install docker             # ❌ 权限不足

# 使用 sudo（有权限）
sudo apt install docker        # ✅ 成功

# 为什么需要 sudo？
- 系统文件需要 root 权限
- 安装软件需要 root 权限
- 修改系统配置需要 root 权限

# 前端类比
sudo = npm install -g（全局安装，需要管理员权限）
不用 sudo = npm install（本地安装）
```

**sudo 使用技巧：**

```bash
# 上一条命令加 sudo
sudo !!

# 例如：
apt install docker            # 忘记加 sudo，失败
sudo !!                       # 自动变成 sudo apt install docker

# 临时切换到 root 用户
sudo su

# 编辑需要权限的文件
sudo nano /etc/nginx/nginx.conf
```

---

## 第 6 章：进程管理

### 6.1 什么是进程？

**进程 = 运行中的程序**

```
程序（文件）        进程（运行中）
node               node app.js（PID: 1234）
nginx              nginx（PID: 5678）
mysql              mysqld（PID: 9012）
```

**前端类比：**
```
package.json       npm script
    ↓                  ↓
npm run dev        Node.js 进程（PID: 1234）
```

### 6.2 查看进程

#### ps - 查看进程（Process Status）

```bash
ps                 # 查看当前终端的进程
ps aux             # 查看所有进程（常用！）
ps aux | grep node # 查看 Node.js 进程

# 输出示例
USER  PID  %CPU %MEM    VSZ   RSS TTY   STAT START   TIME COMMAND
root 1234  0.1  1.2 123456 12345 ?     Ssl  10:30   0:05 node app.js
│    │     │    │      │     │   │     │    │       │    │
│    │     │    │      │     │   │     │    │       │    └── 命令
│    │     │    │      │     │   │     │    │       └── 累计CPU时间
│    │     │    │      │     │   │     │    └── 启动时间
│    │     │    │      │     │   │     └── 状态
│    │     │    │      │     │   └── 终端
│    │     │    │      │     └── 物理内存
│    │     │    │      └── 虚拟内存
│    │     │    └── 内存占用百分比
│    │     └── CPU占用百分比
│    └── 进程ID（PID）
└── 用户
```

#### top - 实时查看进程（类似任务管理器）

```bash
top                # 实时显示进程（按 q 退出）
htop               # top 的增强版（需要安装：apt install htop）

# 前端类比
top = Windows 任务管理器
top = macOS 活动监视器
top = Chrome 任务管理器
```

### 6.3 管理进程

#### kill - 终止进程

```bash
kill 1234          # 终止 PID 为 1234 的进程（友好终止）
kill -9 1234       # 强制终止（-9 = SIGKILL）

# 查找并杀死进程
ps aux | grep node
kill 1234

# 或者一行搞定
pkill -f "node app.js"

# 前端类比
kill = 任务管理器 → 结束任务
kill -9 = 任务管理器 → 结束进程树（强制）
```

#### 后台运行

```bash
# & 后台运行
node app.js &              # 在后台运行，关闭终端会停止

# nohup 后台运行（关闭终端也不停止）
nohup node app.js &        # 输出到 nohup.out
nohup node app.js > app.log 2>&1 &  # 输出到 app.log

# 查看后台任务
jobs

# 前端类比
后台运行 = 双击打开程序，最小化到后台
nohup = 开机自启动的程序
```

### 6.4 系统服务管理（systemctl）

**systemctl = Windows 的"服务"管理**

```bash
# 启动服务
sudo systemctl start nginx

# 停止服务
sudo systemctl stop nginx

# 重启服务
sudo systemctl restart nginx

# 重新加载配置（不重启）
sudo systemctl reload nginx

# 查看服务状态
sudo systemctl status nginx

# 开机自启动
sudo systemctl enable nginx

# 禁用开机自启动
sudo systemctl disable nginx

# 前端类比
systemctl = Windows 服务管理器
systemctl start = 启动服务
systemctl enable = 设置为"自动启动"
```

---

## 第 7 章：网络基础

### 7.1 IP 地址和端口

**IP 地址 = 房子的地址**
**端口 = 房子的门号**

```
192.168.1.100:3000
│            │
│            └── 端口（哪扇门）
└── IP地址（哪栋房子）
```

**端口号范围：**
- `0-1023`：系统端口（需要 root 权限）
  - 22：SSH
  - 80：HTTP
  - 443：HTTPS
- `1024-65535`：用户端口
  - 3000：常用开发端口
  - 3002：你的 Java 后端
  - 8080：常用 Web 端口

**前端类比：**
```
localhost:3000 = 本地开发服务器
localhost:5173 = Vite 默认端口
0.0.0.0:3000 = 监听所有网卡（外网可访问）
127.0.0.1:3000 = 只监听本地（外网不可访问）
```

### 7.2 查看网络状态

#### ifconfig / ip - 查看网络配置

```bash
ifconfig           # 查看网卡信息（旧命令）
ip addr            # 查看网卡信息（新命令）

# 输出示例
eth0: 公网网卡
  inet 123.45.67.89  ← 公网IP

lo: 本地回环
  inet 127.0.0.1     ← localhost
```

#### netstat - 查看端口占用

```bash
# 查看所有监听端口
sudo netstat -tulpn
│        │││  │
│        │││  └── n：显示端口号（不解析服务名）
│        ││└── p：显示进程ID
│        │└── l：只显示监听的端口
│        └── u：UDP
└── t：TCP

# 查看指定端口
sudo netstat -tulpn | grep 3000

# 输出示例
tcp  0.0.0.0:3000  0.0.0.0:*  LISTEN  1234/node
│    │            │          │       │
│    │            │          │       └── 进程ID/程序名
│    │            │          └── 状态
│    │            └── 远程地址
│    └── 本地地址（0.0.0.0 = 监听所有网卡）
└── 协议
```

#### curl - 测试 HTTP 请求

```bash
# 基本请求
curl http://example.com

# 查看响应头
curl -I http://example.com

# 测试本地服务
curl http://localhost:3000

# POST 请求
curl -X POST -H "Content-Type: application/json" \
  -d '{"username":"test"}' \
  http://localhost:3000/api/login

# 前端类比
curl = Postman / Insomnia
curl = fetch() / axios.get()
curl -I = 查看 Response Headers
```

#### ping - 测试网络连接

```bash
ping google.com        # 测试能否访问 Google（Ctrl+C 停止）
ping -c 4 google.com   # 只 ping 4 次

# 前端类比
ping = 测试网络是否通
ping = navigator.onLine（浏览器网络状态）
```

### 7.3 防火墙（ufw）

**ufw = Windows 防火墙**

```bash
# 启用防火墙
sudo ufw enable

# 查看状态
sudo ufw status

# 允许端口
sudo ufw allow 80          # 允许 HTTP
sudo ufw allow 443         # 允许 HTTPS
sudo ufw allow 22          # 允许 SSH
sudo ufw allow 3000        # 允许自定义端口

# 禁止端口
sudo ufw delete allow 3000

# 重置防火墙（删除所有规则）
sudo ufw reset

# 前端类比
ufw = 浏览器的内容安全策略（CSP）
ufw allow = CORS 允许域名
ufw deny = CORS 拒绝
```

---

## 附录：常用命令速查

### A.1 文件操作

| 命令 | 作用 | 示例 | 前端类比 |
|-----|------|------|---------|
| `ls` | 列出文件 | `ls -la` | 文件浏览器 |
| `cd` | 切换目录 | `cd /home` | 切换文件夹 |
| `pwd` | 显示当前目录 | `pwd` | 查看当前路径 |
| `mkdir` | 创建目录 | `mkdir dir` | 新建文件夹 |
| `touch` | 创建文件 | `touch file.txt` | 新建文件 |
| `cp` | 复制 | `cp a.txt b.txt` | Ctrl+C, Ctrl+V |
| `mv` | 移动/重命名 | `mv a.txt b.txt` | 拖拽/F2 |
| `rm` | 删除 | `rm -rf dir` | Delete |
| `cat` | 查看文件 | `cat file.txt` | 打开文件 |
| `less` | 分页查看 | `less file.txt` | 滚动查看 |
| `head` | 查看开头 | `head -n 10` | 前10行 |
| `tail` | 查看结尾 | `tail -f log` | 后10行/实时查看 |

### A.2 搜索和过滤

| 命令 | 作用 | 示例 | 前端类比 |
|-----|------|------|---------|
| `grep` | 搜索文本 | `grep "error" file` | Ctrl+F |
| `find` | 查找文件 | `find . -name "*.js"` | Ctrl+P |
| `\|` | 管道 | `ls \| grep txt` | 函数组合 |
| `>` | 重定向（覆盖） | `ls > file.txt` | 保存输出 |
| `>>` | 重定向（追加） | `ls >> file.txt` | 追加输出 |

### A.3 权限管理

| 命令 | 作用 | 示例 | 说明 |
|-----|------|------|------|
| `chmod` | 修改权限 | `chmod 755 file` | 设置读写执行权限 |
| `chown` | 修改所有者 | `chown user file` | 改变文件所有者 |
| `sudo` | 以管理员执行 | `sudo apt install` | 提升权限 |

### A.4 进程管理

| 命令 | 作用 | 示例 | 前端类比 |
|-----|------|------|---------|
| `ps` | 查看进程 | `ps aux` | 任务管理器 |
| `top` | 实时监控 | `top` | 实时资源监控 |
| `kill` | 终止进程 | `kill 1234` | 结束任务 |
| `systemctl` | 服务管理 | `systemctl start nginx` | 服务管理 |

### A.5 网络操作

| 命令 | 作用 | 示例 | 前端类比 |
|-----|------|------|---------|
| `curl` | HTTP 请求 | `curl http://example.com` | fetch() |
| `ping` | 测试连接 | `ping google.com` | 测试网络 |
| `netstat` | 查看端口 | `netstat -tulpn` | 查看端口占用 |
| `ifconfig` | 查看IP | `ifconfig` | 查看网络配置 |

### A.6 系统信息

| 命令 | 作用 | 示例 | 说明 |
|-----|------|------|------|
| `df` | 磁盘空间 | `df -h` | 查看磁盘使用 |
| `free` | 内存信息 | `free -h` | 查看内存使用 |
| `uname` | 系统信息 | `uname -a` | 查看系统版本 |
| `whoami` | 当前用户 | `whoami` | 显示用户名 |

### A.7 软件管理（apt）

| 命令 | 作用 | 示例 | 前端类比 |
|-----|------|------|---------|
| `apt update` | 更新软件列表 | `sudo apt update` | npm outdated |
| `apt upgrade` | 升级软件 | `sudo apt upgrade` | npm update |
| `apt install` | 安装软件 | `sudo apt install nginx` | npm install |
| `apt remove` | 卸载软件 | `sudo apt remove nginx` | npm uninstall |
| `apt search` | 搜索软件 | `apt search docker` | npm search |

---

## 🎉 总结

### 你学会了什么

✅ **核心概念**
- 服务器、云服务器、操作系统的区别和联系
- Linux 发行版和镜像的概念
- Ubuntu 为什么适合服务器

✅ **文件系统**
- Linux 目录结构
- 绝对路径和相对路径
- 文件类型和权限

✅ **命令行操作**
- 文件操作（ls、cd、cp、mv、rm）
- 查看文件（cat、less、head、tail）
- 搜索过滤（grep、find、管道）

✅ **权限管理**
- 文件权限（rwx、644、755）
- 修改权限（chmod、chown）
- sudo 的使用

✅ **进程管理**
- 查看进程（ps、top）
- 终止进程（kill）
- 服务管理（systemctl）

✅ **网络基础**
- IP 地址和端口
- 网络状态查看
- 防火墙配置

### 下一步

现在你已经掌握了基础运维知识，可以开始实战了！

👉 **继续阅读**：[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

跟着部署指南，把你的 Java + Vue 项目部署到云服务器上！

---

## 📝 学习建议

### 1. 边学边练

```bash
# 不要只看，要动手试试
mkdir test
cd test
touch file.txt
echo "Hello Linux" > file.txt
cat file.txt
```

### 2. 不要怕出错

```bash
# Linux 不会因为你的一个命令就崩溃
# 大胆尝试，最多就是删错文件（有备份）
```

### 3. 善用 --help 和 man

```bash
# 忘记命令用法？
ls --help           # 简单帮助
man ls              # 详细手册（按 q 退出）
```

### 4. 利用 Tab 和历史

```bash
# Tab 自动补全，减少输入
# ↑↓ 浏览历史命令
# Ctrl+R 搜索历史
```

### 5. 记录你的命令

```bash
# 把常用命令记到笔记里
# 或者写成脚本（.sh 文件）
```

---

**准备好开始部署了吗？** 🚀

打开 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)，开始你的全栈之旅！
