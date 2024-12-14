---
date: '2024-12-14T14:32:12+08:00'
draft: false
title: 'React 整体架构'
author: 'qinqinfeng'
ShowToc: true
ShowReadingTime: true
tags: ['react', 'fiber', 'stack', 'virtual dom', 'dom diff']
# description: '本文介绍了 React 的整体架构，包括旧架构和新的 Fiber 架构，以及它们在性能上的差异。'
---

Stack 架构在进行虚拟 DOM 树比较的时候，采用的是递归，计算会消耗大量的时间，新的 Fiber 架构采用的是链表，可以实现时间切片，防止 JS 的计算占用过多的时间从而导致浏览器出现丢帧的现象。

React v15 以及之前的架构称之为 Stack 架构，从 v16 开始，React 重构了整体的架构，新的架构被称之为 Fiber 架构，新的架构相比旧架构有一个最大的特点就是能够实现时间切片。

## 旧架构的问题

有哪些情况会导致我们的 Web 应用无法快速响应？

总结起来，实际上有两大类场景会限制快速响应：

1. 当你需要执行大量计算或者设备本身的性能不足的时候，页面就会出现掉帧、卡顿的现象，这个本质上是来自于 CPU 的瓶颈。
2. 进行 I/O 的时候，需要等待数据返回后再进行后续操作，等待的过程中无法快速响应，这种情况实际上是来自于 I/O 的瓶颈。

![浏览器渲染原理](https://s2.loli.net/2024/12/14/JpdnkURIBOb7Xso.png)