---
date: '2024-12-14T14:32:12+08:00'
draft: false
title: 'React Evolution'
author: 'qinqinfeng'
ShowToc: true
ShowReadingTime: true
tags: ['react', 'fiber', 'stack', 'virtual dom','hooks']
TocOpen: true
summary: '现代前端框架的关键技术，React 的重大更新。关键词：虚拟 DOM、Fiber 架构、Hooks。'
---

# 现代前端框架概述
在早期使用 jQuery 时代，开发人员需要手动的去操作 DOM 节点，那个时候流行的还是 MPA 的模式，各个页面的 JS 代码量还在能够接受的范围。但是随着单页应用的流行，客户端的 JS 代码量出现井喷，此时如果还是采用传统的手动操作 DOM 的方式，对于开发人员来讲有非常大的心智负担。此时就出现了能够基于状态声明式渲染以及提供组件化开发模式的库，例如 Vue 和 React。这两者本质上仅仅是构建 UI 的库，但是随着应用的复杂度的提升，还需要前端路由方案、状态管理方案，所以有了 vue-router、react-router、vuex、redux 等周边生态产品。

React 和 Vue 本身只是**专注于 UI 的渲染**，通常我们会将 React 或者 Vue 称之为框架，往往指的是整个React、Vue本身及其周边生态产品，这可以算是一种约定俗成的说法。严格意义上的框架除了包括库本身以外，还支持其它许多附加功能，除了上面提到的状态和路由管理之外，还包括构建支持、数据流方案、文档工具等等。例如：

- UmiJS：基于 React，内置路由、自构建、部署等功能。
- Next.js：基于 React，支持 SSR、SSG 两大功能的服务端框架。

现代前端框架至少包含以下几个方面：
- 基于状态的声明式渲染
- 支持组件化开发
- 前端路由方案（单页应用的方案）
- 状态管理方案
## 声明式渲染
声明式渲染基于 MVC 的架构，数据模型改变，视图模型自动更改。能够使得开发者更加关注 UI 的实现，而不是 DOM 操作。Vue 的模板语法和 React 的 JSX 都是声明式渲染的实现方式。前者扩展 HTML 语法，在 UI 中描述逻辑，后者则是对 JS 语法的扩展，在逻辑中描述 UI。

### 基于模板的 Vue：“在 UI 中描述逻辑”

在早期前后端未分离的时候，最流行的方案就是使用模板引擎，模板引擎可以看作是在正常的 HTML 上面进行挖坑（不同的模板引擎语法不一样），挖了坑之后，服务器端会将数据填充到挖了坑的模板里面，生成对应的 HTML 页面返回给客户端。

- 客户端：发送请求，接收返回的 HTML。

- 后端
  - 模板引擎（如 JSP、PHP、ASP）根据逻辑生成动态 HTML。
  - 填充数据后返回页面给客户端。
  - 数据库：提供动态数据。

所以在那个时期前端人员的工作，主要是 HTML、CSS 和一些简单的 JS 特效（轮播图、窗口等）。写好的 HTML 是不能直接用的，需要和后端确定用的是哪个模板引擎，接下来再将自己写好的 HTML 按照对应模板引擎的语法进行挖坑。不同的后端技术有不同的模板引擎，同一种后端技术也有不同的模板引擎。

例如： EJS 的模板引擎

```html
<!-- index.ejs -->
<html>
<head>
  <title>模板引擎示例</title>
</head>
<body>
  <h1>欢迎，<%= username %>!</h1>
  <ul>
    <% users.forEach(user => { %>
      <li><%= user %></li>
    <% }) %>
  </ul>
</body>
</html>
```

后端逻辑：

```js
const express = require('express');
const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  const data = {
    username: '张三',
    users: ['张三', '李四', '王五']
  };
  res.render('index', data); // 渲染模板并填充数据
});

app.listen(3000, () => console.log('服务器启动于 http://localhost:3000'));
```

后端返回给前端：
```html
<html>
<head>
  <title>模板引擎示例</title>
</head>
<body>
  <h1>欢迎，张三!</h1>
  <ul>
    <li>张三</li>
    <li>李四</li>
    <li>王五</li>
  </ul>
</body>
</html>
```

现在随着前后端分离的流行，已经没有模板引擎的开发模式，后端人员只需要写接口就可以。但如果让后端人员开发前端语法， Vue 的模板语法还是更为亲切。


### 基于 JSX 的 React：“在逻辑中描述 UI”

JSX 最早起源于 React 团队在 React 中所提供的一种类似于 XML 的 ES 语法糖：

```jsx
const element = <h1>Hello</h1>;
```

经过 Babel 编译之后，就会变成：

```jsx
// React v17 之前
var element = React.createElement("h1", null, "Hello");


// React v17 之后
var jsxRuntime = require("react/jsx-runtime");

var element = jsxRuntime.jsx("h1", { children: "Hello" });
```

无论是 17 之前还是 17 之后，执行了代码后会得到一个对象：

```jsx
{
 "type": "h1",
 "key": null,
 "ref": null,
 "props": {
    "children": "Hello"
 },
 "_owner": null,
 "_store": {}
}
```
这个其实就是大名鼎鼎的虚拟 DOM。

React 团队认为，UI 本质上和逻辑是有耦合部分的：

- 在 UI 上面绑定事件

- 数据变化后通过 JS 去改变 UI 的样式或者结构

作为一个前端工程师，JS 是用得最多的，所以 React 团队考虑屏蔽 HTML，整个都用 JS 来描述 UI，因为这样做的话，可以让 UI 和逻辑配合更加强烈，所以最终设计出来了类 XML 形式的 JS 语法糖。

由于 JSX 是 JS 的语法糖（本质上就是 JS），因此可以非常灵活的和 JS 语法组合使用，例如：

1. 可以在 if 或者 for 当中使用 JSX

2. 可以将 JSX 赋值给变量

3. 可以将 JSX 当作参数来传递，当然而也可以在一个函数中返回一段 JSX

```jsx
function App({ isLoading }) {
 if (isLoading) {
  return <h1>loading...</h1>;
 }
```

这种灵活性就使得 JSX 可以轻松的描述复杂的 UI，如果和逻辑配合，还可以描述出复杂 UI 的变化。使得 React 社区的早期用户可以快速实现各种复杂的基础库，丰富社区生态。又由于生态的丰富性，慢慢吸引了更多的人来参与社区的建设，从而源源不断的形成了一个正反馈。

## 前端路由
早期的时候并不存在前端路由，那个时候是多页应用时代，有多个 html 页面。前端 /about，后端返回 /about.html， 前端 /list，后端返回 list.html。后来，随着单页应用的流行，整个 Web 应用只有一个页面，通过 JS 调整模块，显示不同的内容。

所谓前端路由，就是协调当前页面显示什么模块。（如果不是懒加载需要，打包好 bundle.js, 甚至不需要向静态资源服务器请求模块内容。）后端路由，负责返回对应的数据。MPA 和 SPA 的对比如下图所示：
![前端路由](https://s2.loli.net/2024/12/14/l25D3St8NdVAqJL.png)


# React 发展历程

下图显示了 [npm trends](https://npmtrends.com/angular-vs-react-vs-solid-js-vs-vue) 中，React 的下载量和 Vue、Solid.js 的对比。不管从什么角度来看，React 都是前端框架的先驱，例如，React 率先使用 jsx 描述 UI，使得 UI 和逻辑的耦合性更强，目前 Vue 等框架也支持 jsx 语法；前端路由中，使用对象的形式对路由进行描述也是从 React 开始流行起来的。React 创新性地将虚拟 DOM 引入到前端框架中，使得前端框架的性能得到了极大的提升...
![React 下载量对比](https://s2.loli.net/2024/12/14/7SWtjk9hG4ARpLf.png)

React 的重大更新如下：
- React 16
  - 引入 Fiber 架构，使更新过程可中断、可分片、具有优先级
- React 16.8
  - 引入 Hooks，使函数组件可以拥有状态
- React 18
  - 引入 Concurrent Mode，使 React 可以进行时间切片
  - 引入 Suspense，使 React 可以进行代码分割

- React 19
  - 引入 Actions，使 React 可以进行异步操作





# React 16
在 React v15 以及之前的架构称之为 Stack 架构，从 v16 开始，React 重构了整体的架构，新的架构被称之为 Fiber 架构，新的架构相比旧架构有一个最大的特点就是能够实现时间切片。

Stack 架构在进行虚拟 DOM 树比较的时候，采用的是递归，计算会消耗大量的时间，新的 Fiber 架构采用的是链表，可以实现时间切片，防止 JS 的计算占用过多的时间从而导致浏览器出现丢帧的现象。


## Stack 架构的问题

有哪些情况会导致我们的 Web 应用无法快速响应？

总结起来，实际上有两大类场景会限制快速响应：

1. 当你需要执行大量计算或者设备本身的性能不足的时候，页面就会出现掉帧、卡顿的现象，这个本质上是来自于 CPU 的瓶颈。
2. 进行 I/O 的时候，需要等待数据返回后再进行后续操作，等待的过程中无法快速响应，这种情况实际上是来自于 I/O 的瓶颈。

### CPU 瓶颈
平时我们在浏览网页的时候，这张网页实际上是由浏览器绘制出来的，详情可见文章[**浏览器渲染原理**](/posts/browser-render)。
![渲染流水线](https://s2.loli.net/2024/12/14/GbxTFArIXN12WUC.png)
图中的任务被称为“渲染流水线”，每次执行流水线的时候，大致是需要如上的一些步骤，但是并不是说每一次所有的任务都需要全部的执行：

- 当通过 JS 或者 CSS 修改 DOM 元素的任何属性（比如长度、宽度）时，会触发完整的渲染流水线，这种情况称之为 重排（回流）。
- 当修改的属性不涉及几何属性（比如字体、颜色）时，会省略掉流水线中的 Layout、Layer 过程，这种情况称之为 重绘。
- 当修改不涉及重排、重绘的属性（比如 transform 属性），会省略流水线中 Layout、Layer、Print 过程，仅执行合成线程的绘制工作，这种情况称之为 合成。

在 React v16 之前就存在这个问题，JS 代码执行的时间过长。在 React 中，需要去计算整颗虚拟 DOM 树，虽然说是 JS 层面的计算，相比直接操作 DOM，节省了很多时间，但是每次去计算整颗虚拟 DOM 树，会造成每一顿的 JS 代码执行时间过长，从而导致动画、还有一些实时更新得不到及时的响应，造成卡顿的视觉效果。

在 React v16 版本之前，进行两颗虚拟 DOM 树的对比的时候，需要涉及到遍历虚拟DOM的结构，这个时候只能使用递归，而且这种递归是不能够打断的，一条路走到黑，从而造成了 JS 执行时间过长。这样的架构模式，官方就称之为 Stack 架构。因为采用的是递归，会不停的开启新的函数栈。

### I/O 瓶颈
对前端来讲，最主要的 I/O 瓶颈是网络延迟。

网络延迟是一种客观存在的现象，React 通过将人机交互的结果整合到 UI 中，来解决问题。用户对卡顿的感知是不一样的，对于输入框，哪怕只有轻微延迟，也会觉得很卡。对于列表，如果loading好几秒，用户也不会觉得很卡。

对于 React来讲，所有的操作都是数据变化导致的重新渲染，我们只需要对不同的操作赋予不同的优先级。具体来说，主要包含以下三个点：

- 为不同操作造成的 数据变化 赋予不同的优先级。
- 所有优先级统一调度，优先处理 最高优先级的更新。
- 如果更新正在进行（进入虚拟 DOM 相关工作），此时有 更高优先级的更新 产生的话，中段当前的更新，优先处理高优先级更新。

要实现上面的这三个点，就需要 React 虚层能实现：

- 用于调度优先级的调度器。
- 调度器对应的调度算法。
- 支持可中断的虚拟 DOM 的实现。

所以不管是解决 CPU 的瓶颈还是 I/O 的瓶颈，底层的诉求都是需要实现 time slice。

## Fiber 架构的改进
从 React v16 开始，官方团队正式引用了 Fiber 的概念，这是一种通过链表来描述 UI 的方式，本质上也是一种虚拟 DOM 的实现。[React 官方对虚拟DOM的定义](https://zh-hans.legacy.reactjs.org/docs/faq-internals.html)，是描述 DOM 的数据结构。Fiber 本质上也是一个对象，但是和之前 React 元素不同的地方在于对象之间使用链表的结构串联起来，child 指向子元素，sibling 指向兄弟元素，return 指向父元素。


![Fiber 实现DOM](https://s2.loli.net/2024/12/14/WbHhu8nEfwQ5rSp.png)

使用链表这种结构，有一个最大的好处就是在进行整颗树的对比（reconcile）计算时，这个过程是可以被打断。在发现一帧时间已经不够，不能够再继续执行 JS，需要渲染下一帧的时候，这个时候就会打断 JS 的执行，优先渲染下一帧。渲染完成后再接着回来完成上一次没有执行完的 JS 计算。

官方还提供了一个 Stack 架构和 Fiber 架构的对比示例，[显示了在海量DOM变化时，Stack 架构和 Fiber 架构的不同表现](https://claudiopro.github.io/react-fiber-vs-stack-demo/)。

React v16之前：

- Reconciler（协调器）：vdom 的实现，根据自变量的变化计算出 UI 的变化
- Renderer（渲染器）：负责将 UI 的变化渲染到宿主环境

从 React v16 开始，多了一个组件：

- Scheduler（调度器）：调度任务的优先级，高优先级的任务会优先进入到 Reconciler
- Reconciler（协调器）：vdom 的实现，根据自变量的变化计算出 UI 的变化
- Renderer（渲染器）：负责将 UI 的变化渲染到宿主环境

新架构中，Reconciler 的更新流程也从之前的递归变成了“可中断的循环过程”。

```js
function workLoopConcurrent{
  // 如果还有任务，并且时间切片还有剩余的时间
  while(workInProgress !== null && !shouldYield()){
    performUnitOfWork(workInProgress);
  }
}

function shouldYield(){
  // 当前时间是否大于过期时间, 其中 deadline = getCurrentTime() + yieldInterval
  // yieldInterval 为调度器预设的时间间隔，默认为 5ms
  return getCurrentTime() >= deadline;
}
```

每次循环都会调用 shouldYield 判断当前的时间切片是否有足够的剩余时间，如果没有足够的剩余时间，就暂停 reconciler 的执行，将主线程还给渲染流水线，进行下一帧的渲染操作，渲染工作完成后，再等待下一个宏任务进行后续代码的执行。

![Fiber 架构](https://s2.loli.net/2024/12/14/rgYenqlDHSbJiFz.png)

## React 渲染流程

React 渲染分为两大阶段，render 阶段和 commit 阶段，其中，render 阶段的工作是在内存里面进行的，所以任务可以随时可以被打断，由于其不会更新宿主环境 UI，因此这个阶段即使工作流程反复被中断，用户也不会看到“更新不完整的 UI”。commit 阶段则在宿主环境发生，根据虚拟 DOM 计算出来的结果，更新宿主环境 UI，任务不可以被打断。每个阶段对应不同的组件：

- render 阶段：调合虚拟 DOM，计算出最终要渲染出来的虚拟 DOM。
    - 调度器（Scheduer）：调度任务，为任务排序优先级，让优先级高的任务先进入到 Reconciler。
    - 协调器（Reconciler）：生成 Fiber 对象，收集副作用，找出哪些节点发生了变化，打上不同的 flags，著名的 diff 算法也是在这个组件中执行的。
- commit 阶段：根据上一步计算出来的虚拟 DOM，渲染具体的 UI。
    - 渲染器（Renderer）：根据协调器计算出来的虚拟 DOM 同步的渲染节点到视图上。

当 Scheduler 调度完成后，将任务交给 Reconciler，Reconciler 就需要计算出新的 UI，最后就由 Renderer **同步**进行渲染更新操作。

### 调度器
Scheduler 在浏览器的原生 API 中实际上是有类似的实现的，这个 API 就是 [requestIdleCallback](https://link.juejin.cn?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fzh-CN%2Fdocs%2FWeb%2FAPI%2FWindow%2FrequestIdleCallback)。虽然每一帧绘制的时间约为 16.66ms，但是如果屏幕没有刷新，那么浏览器会安排长度为 50ms 左右的空闲时间。

为什么是 50ms？

根据研究报告表明，用户操作之后，100ms 以内的响应给用户的感觉都是瞬间发生，也就是说不会感受到延迟感，因此将空闲时间设置为 50，浏览器依然还剩下 50ms 可以处理用户的操作响应，不会让用户感到延迟。

```js
function delay(duration) {
    const start = Date.now()
    while(Date.now() - start < duration){
    }
}

const taskList = []
for(let i = 0; i < 10; i++){
    taskList.push(() => {
        delay(5)
    })
}
function callback(IdleDeadline) {
        while(IdleDeadline.timeRemaining() > 0 && taskList.length > 0){
        console.log('当前执行到任务', 10 - taskList.length, '当前帧剩余时间：', IdleDeadline.timeRemaining())
        taskList.shift()()
    }
    if(taskList.length > 0){
        // 如果任务列表中还有任务，则继续执行
        window.requestIdleCallback(callback)
        console.log('有任务未执行完，继续执行', IdleDeadline.timeRemaining())
    }
}
window.requestIdleCallback(callback)
```

虽然浏览器有类似的 API，但是 React 团队并没有使用该 API，因为该 API 存在兼容性问题。因此 React 团队自己实现了一套这样的机制，这个就是调度器 Scheduler。

React 团队已经单独发行这个 Scheduler，这意味着调度器不仅仅只能在 React 中使用，凡是有涉及到任务调度需求的项目都可以使用 [Scheduler](https://www.npmjs.com/package/scheduler)。

### 协调器

协调器是 render 阶段的第二阶段工作，类组件或者函数组件本身就是在这个阶段被调用的。

根据 Scheduler 调度结果的不同，协调器起点可能是不同的

- performSyncWorkOnRoot（同步更新流程）
- performConcurrentWorkOnRoot（并发更新流程）

```js
// performSyncWorkOnRoot 会执行该方法
function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}
```

```js
// performConcurrentWorkOnRoot 会执行该方法
function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}
```

新的架构使用 Fiber（对象）来描述 DOM 结构，最终需要形成一颗 Fiber tree，这不过这棵树是通过链表的形式串联在一起的。

workInProgress 代表的是当前的 FiberNode。

performUnitOfWork 方法会创建下一个 FiberNode，并且还会将已创建的 FiberNode 连接起来（child、return、sibling），从而形成一个链表结构的 Fiber tree。

如果 workInProgress 为 null，说明已经没有下一个 FiberNode，也就是说明整颗 Fiber tree 树已经构建完毕。

上面两个方法唯一的区别就是是否调用了 shouldYield 方法，该方法表明了是否可以中断。

performUnitOfWork 在创建下一个 FiberNode 的时候，整体上的工作流程可以分为两大块：

- 递阶段
- 归阶段

**递阶段**

递阶段会从 HostRootFiber 开始向下以深度优先的原则进行遍历，遍历到的每一个 FiberNode 执行 beginWork 方法。该方法会根据传入的 FiberNode 创建下一级的 FiberNode，此时可能存在两种情况：

- 下一级只有一个元素，beginWork 方法会创建对应的 FiberNode，并于 workInProgress 连接

```jsx
<ul>
  <li></li>
</ul>
```

这里就会创建 li 对应的 FiberNode，做出如下的连接：

```js
LiFiber.return = UlFiber;
```

- 下一级有多个元素，这是 beginWork 方法会依次创建所有的子 FiberNode 并且通过 sibling 连接到一起，每个子 FiberNode 也会和 workInProgress 连接

```jsx
<ul>
  <li></li>
  <li></li>
  <li></li>
</ul>
```

此时会创建 3 个 li 对应的 FiberNode，连接情况如下：

```js
// 所有的子 Fiber 依次连接
Li0Fiber.sibling = Li1Fiber;
Li1Fiber.sibling = Li2Fiber;

// 子 Fiber 还需要和父 Fiber 连接
Li0Fiber.return = UlFiber;
Li1Fiber.return = UlFiber;
Li2Fiber.return = UlFiber;
```

由于采用的是深度优先的原则，因此无法再往下走的时候，会进入到归阶段。

**归阶段**

归阶段会调用 completeWork 方法来处理 FiberNode，做一些副作用的收集。

当某个 FiberNode 执行完了 completeWork 方法后，如果存在兄弟元素，就会进入到兄弟元素的递阶段，如果不存在兄弟元素，就会进入父 FiberNode 的归阶段。

```js
function performUnitOfWork(fiberNode) {
  // 省略 beginWork
  if (fiberNode.child) {
    performUnitOfWork(fiberNode.child);
  }
  // 省略 CompleteWork
  if (fiberNode.sibling) {
    performUnitOfWork(fiberNode.sibling);
  }
}
```

最后我们来看一张图：
![协调器](https://s2.loli.net/2024/12/14/8Wr2daboiXwAMG9.png)


### 渲染器

Renderer 工作的阶段被称之为 commit 阶段。该阶段会将各种副作用 commit 到宿主环境的 UI 中。相较于之前的 render 阶段可以被打断，commit 阶段一旦开始就会**同步**执行直到完成渲染工作。

整个渲染器渲染过程中可以分为三个子阶段：

- BeforeMutation 阶段
- Mutation 阶段
- Layout 阶段



## Fiber 双缓冲
Fiber 可以从三个方面去理解：
- **FiberNode 作为一种架构**：在 React v15 以及之前的版本中，Reconceiler 采用的是递归的方式，因此被称之为 Stack Reconciler，到了 React v16 版本之后，引入了 Fiber，Reconceiler 也从 Stack Reconciler 变为了 Fiber Reconceiler，各个 FiberNode 之间通过链表的形式串联了起来。
- **FiberNode 作为一种数据类型**：Fiber 本质上也是一个对象，是之前虚拟 DOM 对象（React 元素，createElement 的返回值）的一种升级版本，每个 Fiber 对象里面会包含 React 元素的类型，周围链接的 FiberNode，DOM 相关信息。
- **FiberNode 作为动态的工作单元**：在每个 FiberNode 中，保存了“本次更新中该 React 元素变化的数据、要执行的工作（增、删、改、更新Ref、副作用等）”等信息。

所谓 Fiber 双缓冲树，指的是在内存中构建两颗树，并直接在内存中进行替换的技术。在 React 中使用 Wip Fiber Tree 和 Current Fiber Tree 这两颗树来实现更新的逻辑。Wip Fiber Tree 在内存中完成更新，而 Current Fiber Tree 是最终要渲染的树，两颗树通过 alternate 指针相互指向，这样在下一次渲染的时候，直接复用 Wip Fiber Tree 作为下一次的渲染树，而上一次的渲染树又作为新的 Wip Fiber Tree，这样可以加快 DOM 节点的替换与更新。
![Fiber 双缓冲树](https://s2.loli.net/2024/12/14/jn5oyRT6vEOphYF.png)


