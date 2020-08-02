---
category: 简介
order: 1
title: Getting Started With react-source
---

react-source是JavaScript应用程序的可预测状态容器。 它可以帮助您编写性能一致，在不同环境（客户端，服务器和本机）中运行且易于测试的应用程序。最重要的是，它提供了出色的开发人员体验，例如实时代码编辑和时间旅行调试器的结合。 您可以将react-source与React或任何其他视图库一起使用。它很小（2kB，包括依赖项），但是具有大量可用插件。

## 安装

[react-source Toolkit](https://react-source-toolkit.js.org/)是我们官方推荐的编写react-source逻辑的方法。它包含react-source核心，并包含我们认为对构建react-source应用至关重要的软件包和功能。 react-source Toolkit建立在我们建议的最佳实践中，可简化大多数react-source任务，防止常见错误，并使编写react-source应用程序更加容易。 RTK包含有助于简化许多常见用例的实用程序，包括商店设置，创建化简器和编写不可变的更新逻辑，甚至立即创建状态的整个“切片”。 无论您是设置第一个项目的全新react-source用户，还是想简化现有应用程序的资深用户，react-source Toolkit都可以帮助您改善react-source代码。 react-source Toolkit是NPM上的一个软件包，可与模块捆绑器或Node应用程序一起使用：

```bash
# NPM
npm install @react-sourcejs/toolkit

# Yarn
yarn add @react-sourcejs/toolkit
```

创建一个React react-source应用 建议使用React和react-source启动新应用的方法是使用用于创建React App的官方react-source + JS模板，该模板利用react-source Toolkit和React react-source与React组件的集成。

```bash
npx create-react-app my-app --template react-source

```

## 基础案例

```js
import { createStore } from 'react-source'

/**
 * 下面的这个counter函数就是一个reducer，对于state而言，它的数据结构是弹性的，可以是原生数据类型、对象、数组。
 * 但无论是合作类型的值，它要发送改变的唯一途径就是返回一个新的state。
 * */
function counter(state = 0, action) {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1
    case 'DECREMENT':
      return state - 1
    default:
      return state
  }
}


// 给应用创建一个全局store
// store API有：{ subscribe, dispatch, getState }.
let store = createStore(counter)


// 下面整个案例我们使用subscribe()方法更新UI，但是实际业务代码中，我们很少直接调用，而是直接绑定在React视图层上。
// 当然也可以直接放置在localStorage
store.subscribe(() => console.log(store.getState()))


// state改变的唯一方式就是dispatch 一个action对象，actions可以序列化、logged、存储、重新渲染
store.dispatch({ type: 'INCREMENT' })
// 1
store.dispatch({ type: 'INCREMENT' })
// 2
store.dispatch({ type: 'DECREMENT' })
// 1
```

您可以直接使用状态对象（称为操作）指定要发生的变化，而不是直接更改状态。然后，编写一个称为reducer的特殊函数，以决定每个动作如何转换整个应用程序的状态。 在典型的react-source应用程序中，只有一个具有单一Store。随着您的应用程序的增长，您将root reducer拆分为较小的reducer，这些reducers分别在状态树的不同部分上运行。这就像在React应用程序中只有一个根组件一样，但是它由许多小组件组成。