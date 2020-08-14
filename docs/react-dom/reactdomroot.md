---
category: React DOM
order: 6
title: 万物之源ReactDOMRoot
---

**ReactDOMRoot**构造函数可以说是React在浏览器环境中的万物之源，react-dom可以通过`render`,`createRoot`方法初始化一个`reactRoot`实例。

### render方法

```js
function legacyCreateRootFromDOMContainer(container,forceHydrate) {
  return createLegacyRoot(
    container,
    false,
  );
}

export function createLegacyRoot(container, false) {
  return new ReactDOMBlockingRoot(container, LegacyRoot, false);
}

function ReactDOMBlockingRoot(container, tag, options) {
  this._internalRoot = createRootImpl(container, tag, options);
}
```

### createRoot方法

```js
export function createRoot(container, options) {
  return new ReactDOMRoot(container, options);
}

function ReactDOMRoot(container, options) {
  // 如果只是传统的render渲染ConcurrentRoot为2
  this._internalRoot = createRootImpl(container, ConcurrentRoot, options);
}
// 大家可以看到比起ReactDOMBlockingRoot构造函数，除了共有的`_internalRoot`属性
// 多了ReactDOMRoot两个方法`render`和`unmount`:

ReactDOMRoot.prototype.render = function (children) {
  const root = this._internalRoot;
  // 不论是渲染和卸载，都会执行容器更新
  updateContainer(children, root, null, null);
};

ReactDOMRoot.prototype.unmount = function () {
  const root = this._internalRoot;
  const container = root.containerInfo;
  updateContainer(null, root, null, () => {
    // 区别在于当前为root的容器会被抹去root标签
    unmarkContainerAsRoot(container);
  });
};
```
## 虚拟DOM的挂载点_internalRoot私有属性

**_internalRoot**是React的一个重要概念，它是基础一个指针。对于React原理有所了解的朋友都知道，React的diff算法基于fiber树这个概念呢。而**_internalRoot**所指向的对象就是`fiberRoot`。

```js
function createRootImpl(container, tag, options) {
  // 由于React支持服务端渲染，作为讲解我们假设当前处于浏览器端渲染
  const hydrate = options != null && options.hydrate === true;
  const hydrationCallbacks =
    (options != null && options.hydrationOptions) || null;
  const mutableSources =
    (options != null &&
      options.hydrationOptions != null &&
      options.hydrationOptions.mutableSources) ||
    null;
  // 故以上的常量hydrate、hydrationCallbacks、mutableSources均为null

  // 创建一个Container，在fiber概念中，它被称为fiberRoot。它并非在react-dom库中，而是在react-reconciler库、/// 中。createContainer这个函数实际调用的函数叫createFiberRoot

  const root = createContainer(container, tag, hydrate, hydrationCallbacks);
  markContainerAsRoot(root.current, container);
  // 正常情况下container.nodeType只有一个DOCUMENT_NODE
  const containerNodeType = container.nodeType;
  // 类型检查和服务端渲染代码此处省略，
  ...
  // 返回fiberRoot
  return root;
}
```

按说涉及到`react-reconciler`库的内容不应该在`react-dom`库中说的，但是为了彻底理解fiberRoot对象在react-dom中的使用还是做一个简单的讲解：

```js
export function createFiberRoot(containerInfo,tag,hydrate,hydrationCallbacks) {
  // 初始化root对象
  const root = new FiberRootNode(containerInfo, tag, hydrate);
  // 创建一个非初始化的HostRootFiber
  const uninitializedFiber = createHostRootFiber(tag);
  // fiberRoot的current指向这个fiber
  root.current = uninitializedFiber;
  // 而uninitializedFiber.stateNode又指向root
  // 这就是fiber双向指针机制，在这里通过current和stateNode两个指针
  // 让fiberRoot树和current HostRoot树建立了相互关联。
  uninitializedFiber.stateNode = root;
  // 初始化current fiber
  initializeUpdateQueue(uninitializedFiber);
  return root;
}
```

## 容器与root的关联

在上面`react-reconciler`库我们已经初始化好了整个fiber树，在这个fiber树中，既有**FiberRoot**，也有了一个已经初始化完毕的**HostRoot**，通过递归算法下面会有`ClassComponent`、`HostComponet`、`HostText`这类普通FiberNode ***（注：HostRoot也是FiberNode，区别在下面的代码中会看到）***。

我们现在回到`react-dom`库:

```js
const internalContainerInstanceKey = '__reactContainer$' + randomKey;

export function markContainerAsRoot(hostRoot, node) {
  // 我们可以看见HostRoot这个FiberNode 相比其他普通的FiberNode，它有一个特殊的
  // 属性：node.__reactContainer$randomKey
  node[internalContainerInstanceKey] = hostRoot;
}
```