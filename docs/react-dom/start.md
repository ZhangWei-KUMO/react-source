---
category: React DOM
order: 1
title: React DOM的API
---

React作为一个可以在多个渲染环境中执行的库，针对不同的环境有着不同的渲染器（renderer），如ReactNative（iOS、Android）、ReactART（SVG/Canvas）、Fabric。其中对于浏览器端的DOM，React采用的是React-DOM作为渲染器。由于篇幅有限，本章采用最为广泛的React-DOM库作为渲染器实现React-Fiber渲染以及React生命周期的讲解。

ReactDOM这个库中暴露的API和属性位于`ReactDOM.js`，我们将这些API和属性分为：

1. 常规API
2. 实验版API
3. 已废弃API
4. 不稳定API
5. Internal属性
  
## 常规API

```js
export {
  render, // 最为常用的客户端渲染入口
  hydrate, // 服务端渲染入口
  unmountComponentAtNode,// 卸载组件
  createPortal,// 将子节点渲染DOM节点中，但是该节点又脱离在DOM层次结构之外。[更多内容](https://stackoverflow.com/questions/46393642/how-to-use-reactdom-createportal-in-react-16)
  ReactVersion as version,  // React版本号
  flushSync, // 组件内部同步更新state
```

> flushSync刷新整个DOM树，并实际上强制完全重新渲染以进行一次调用内发生的更新。除非是特殊情况开发中基本不用这个API

## 实验版API

```js
export {
  createRoot,
  createBlockingRoot,
}
```
`

## 不稳定API

```js
export {
  createEventHandle as unstable_createEventHandle,
  batchedUpdates as unstable_batchedUpdates,
  flushControlled as unstable_flushControlled,
  scheduleHydration as unstable_scheduleHydration,
  renderSubtreeIntoContainer as unstable_renderSubtreeIntoContainer,
  runWithPriority as unstable_runWithPriority,
}
```

## 已废弃API

```js
export {
    findDOMNode, // 访问底层DOM的应急API
}
```

## Internal属性

```js
const Internals = {
  Events: [
    getInstanceFromNode,
    getNodeFromInstance,
    getFiberCurrentPropsFromNode,
    enqueueStateRestore,
    restoreStateIfNeeded,
    flushPassiveEffects,
    IsThisRendererActing,
  ],
};
```

## 总结

在接下来的章节中，我们将首先针对`Internals`进行讲解，然后具体讲解`render`等常规API的源码实现。