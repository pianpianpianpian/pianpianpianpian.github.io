---
date: '2024-12-14T14:32:12+08:00'
draft: false
title: '新 Mac 安装配置'
author: 'qinqinfeng'
ShowToc: true
ShowReadingTime: true
tags: ['mac', 'zsh', 'vscode']

---

# 命令行工具

## 安装 Homebrew

Homebrew 可以理解为 macOS 上的第三方应用商店，很多软件都可以通过 Homebrew 一条命令安装
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

然后在 `~/.zshrc` 的最后加入
```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
```

执行

```bash
source ~/.zshrc
```
即可生效使用 `brew` 命令
常用软件均可使用 `brew` 进行安装，例如 Chrome、Visual Studio Code 等

```bash
brew install --cask visual-studio-code google-chrome
```

使用
```bash
brew upgrade # 更新命令行软件
brew upgrade --greedy # 更新命令行软件和 GUI 软件
```

### 配置 brew 的 shell 补全

<https://docs.brew.sh/Shell-Completion#configuring-completions-in-zsh>

在安装完 oh-my-zsh 和 brew 以后, 执行以下命令:

```bash
mkdir -p "$ZSH/custom/completions"
ln -s "$(brew --prefix)/share/zsh/site-functions/_brew" "$ZSH/custom/completions/_brew"
source ~/.zshrc
```

即可在使用 brew 命令时获得补全功能。


## 安装 oh-my-zsh

`oh-my-zsh` 提供了 `zsh` 的一系列主题及插件管理，使 `zsh` 能成为更好用的 `shell`
```bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

可以参考 `oh-my-zsh` 官网 <https://ohmyz.sh> ，对 `oh-my-zsh` 主题及插件进行配置。

### 配置 `zsh-autosuggestions`

`zsh-autosuggestions` 是 `zsh` 的自动补全插件，可以自动补全命令行中的命令。

```bash
git clone https://github.moeyy.xyz/https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
```

### 配置`zsh-syntax-highlighting`
`zsh-syntax-highlighting` 是 `zsh` 的语法高亮插件，可以高亮命令行中的命令。

```bash
git clone https://github.moeyy.xyz/https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
```

## 启用插件
修改 `~/.zshrc` 文件，在 `plugins` 中添加插件名称，例如 `zsh-syntax-highlighting`

```bash
plugins=(git zsh-autosuggestions zsh-syntax-highlighting)
```

执行
```bash
source ~/.zshrc
```

即可启用插件。

<!-- ## 安装 `termshot`

```bash
git clone https://github.moeyy.xyz/https://github.com/qinqinfeng/zsh-termshot.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-termshot
``` -->


# 安装 BetterDisplay

BetterDisplay 是一款显示器管理软件，通过它，可以让不支持 HiDPI 的 2K、1080P 显示器也开启 HiDPI，并且支持通过 BetterDisplay 直接调节显示器亮度，无需操作显示器上的物理按钮

```bash
brew install --cask betterdisplay
```

# 安装 iTerm2

macOS 自带的终端功能较少且性能较差，我们可以安装各类第三方终端满足自己的需求，比较常见的是使用 iTerm2, 支持多 Tab、分屏、多屏同时操作等等

```bash
brew install --cask iterm2
```

# VSCode 插件

## Color Highlight
Color Highlight 可以高亮代码中的颜色值。
## Tailwind Snippets

自动提示 Tailwind 行内样式书写方式。

## React-Native/React/Redux snippets for es6/es7
使用快捷键 `rsf` 一键创建函数组件。