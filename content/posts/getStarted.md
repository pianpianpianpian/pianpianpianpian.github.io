---
date: '2024-12-14T14:32:12+08:00'
draft: false
title: '新 Mac 安装配置'
author: 'qinqinfeng'
ShowToc: true
ShowReadingTime: true
tags: ['mac', 'zsh', 'iterm2', 'vscode', 'betterdisplay']
---


## 安装 oh-my-zsh

oh-my-zsh 提供了 zsh 的一系列主题及插件管理，使 zsh 能成为更好用的 shell

    sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

可以参考 oh-my-zsh 官网 <https://ohmyz.sh> ，对 oh-my-zsh 主题及插件进行配置oh-my-zsh

例如，git 简写和 autocomplete 自动补全代码：

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/4cd8b80c7a714e3896baa62d3938328f~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5b6I5YaF5ZCR5Z2Q6L2m6YO95Z2Q6L2m6aG25LiK:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiNTU0MjIyMzc1NDQwNzIifQ%3D%3D&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1734763842&x-orig-sign=Ld%2FYBzRuSZkwpbRipQX4O0ZmTek%3D)

## 安装 Homebrew

Homebrew 可以理解为 macOS 上的第三方应用商店，很多软件都可以通过 Homebrew 一条命令安装

    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

然后在 `~/.zshrc` 的最后加入

    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc

执行

    source ~/.zshrc

即可生效使用 `brew` 命令

常用软件均可使用 `brew` 进行安装，例如 Chrome、Visual Studio Code 等

    brew install --cask visual-studio-code google-chrome

使用

    brew upgrade # 更新命令行软件
    brew upgrade --greedy # 更新命令行软件和 GUI 软件

## 配置 brew 的 shell 补全

<https://docs.brew.sh/Shell-Completion#configuring-completions-in-zsh>

在安装完 oh-my-zsh 和 brew 以后, 执行以下命令:

    mkdir -p "$ZSH/custom/completions"
    ln -s "$(brew --prefix)/share/zsh/site-functions/_brew" "$ZSH/custom/completions/_brew"
    source ~/.zshrc

即可在使用 brew 命令时获得补全功能。

## 安装 BetterDisplay

BetterDisplay 是一款显示器管理软件，通过它，可以让不支持 HiDPI 的 2K、1080P 显示器也开启 HiDPI，并且支持通过 BetterDisplay 直接调节显示器亮度，无需操作显示器上的物理按钮

    brew install --cask betterdisplay

## 安装 iTerm2

macOS 自带的终端功能较少且性能较差，我们可以安装各类第三方终端满足自己的需求，比较常见的是使用 iTerm2

    brew install --cask iterm2

**iTerm2**

支持多 Tab、分屏、多屏同时操作等等

# VSCode 插件

## Color Highlight

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/dd459a5a69bd440882b7a860e2ff9ceb~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5b6I5YaF5ZCR5Z2Q6L2m6YO95Z2Q6L2m6aG25LiK:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiNTU0MjIyMzc1NDQwNzIifQ%3D%3D&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1734763842&x-orig-sign=rjzknR5DPNi5zmc%2FaUAZDgFrluU%3D)

## Tailwind Snippets

自动提示 Tailwind 行内样式书写方式

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/f8930975041e4044807d4cb8d1dd4978~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5b6I5YaF5ZCR5Z2Q6L2m6YO95Z2Q6L2m6aG25LiK:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiNTU0MjIyMzc1NDQwNzIifQ%3D%3D&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1734763842&x-orig-sign=l5OeqeQEIpewOkUcC3C%2FFVCYTi4%3D)

## React-Native/React/Redux snippets for es6/es7

rsf 一键创建函数组件

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/45c3390da4484c6ca7fa1d4146501cde~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5b6I5YaF5ZCR5Z2Q6L2m6YO95Z2Q6L2m6aG25LiK:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiNTU0MjIyMzc1NDQwNzIifQ%3D%3D&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1734763842&x-orig-sign=ccD%2FZA%2BiBR7PpVB6SuWYcn5OPgI%3D)
