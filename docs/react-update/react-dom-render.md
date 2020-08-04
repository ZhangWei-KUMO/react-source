---
category: React更新
order: 1
title: React DOM渲染
---

对于React的更新只有三种方式：

1. ReactDOM.render || ReactDOM.hydrate
2. setState
3. forceUpdate

其中大家用的最多的就是`ReactDOM.render`和`setState`。对于React的更新，它的步骤分为：

1. 创建**React Root**
2. 创建**FiberRoot**和**RootFiber** 
3. 创建**Update**
4. React进入调度阶段，即**Schedule阶段**

> 划重点：FiberRoot和RootFiber不是一个概念，二者之间的差别请参考**React源码中的类**一章，而在update阶段，首次渲染不会触发批量渲染。

我们首先看一段简单的React业务代码：

```js
ReactDOM.render(<App/>,document.getElementById('root'));
```

根据上一章内容，我们可以知道在这里`<App/>`这个组件，会通过`React.createElement()`方法生成一个**树结构**。

<img src="https://test-1253763202.cos.ap-shanghai.myqcloud.com/docs/react-source/dom_tree.png" style="width:100%" alt="树架构"/>

## ReactDOM库

**react-dom库是针对浏览器环境独立于react库的第三方库**, 他针对浏览器和Node.js端分别将代码分在了client和server两个文件夹下，本节基于浏览器端，所以我们首先打开`react-dom/src/client/ReactDOM.js`。

```js
import {
  findDOMNode,
  render,
  hydrate,
  ...,
} from './ReactDOMLegacy';
...

// 在这里暴露了ReactDOM对象，这里有我们常见的方法，如：render，hydrate
export {
  createPortal,
  ...,
  findDOMNode,
  hydrate,
  render,
  ...,
};
```

我们从最常用的`render`方法开始,打开`ReactDOMLegacy.js`：

```js
export function render(
  // 所要渲染的React 元素树
  element: React$Element<any>,
  // 所挂载的真实DOM节点
  container: Container,
  // 在整个虚拟DOM渲染结束之后的回调函数，一般情况下我们不使用
  callback: ?Function,
) {
  invariant(
    isValidContainer(container),
    'Target container is not a DOM element.',
  );
  // 在这里你会发现我们常用的render方法实际调用的是其底层的legacyRenderSubtreeIntoContainer
  // 方法
  return legacyRenderSubtreeIntoContainer(
    null,
    element,
    container,
    false, // 注意：这里传入了一个写的死的false参数，表示forceHydrate关闭
    callback,
  );
}
// 第一步：进入render和hydrate实际调用的函数
function legacyRenderSubtreeIntoContainer(
  parentComponent: ?React$Component<any, any>,
  children: ReactNodeList,
  container: Container,
  forceHydrate: boolean,
  callback: ?Function,
) {
  let root: RootType = (container._reactRootContainer: any);
  let fiberRoot;
  // 下面的逻辑非常重要，尽管React的渲染更新都是基于fiberRoot，但是首次渲染个更新渲染逻辑并不相同
  // 不同之处在于两点：1. 首次渲染需要创建Root；2. 更新渲染调用的是批量更新
  // 因为首次挂载并不存在container._reactRootContainer属性/root
  if (!root) {
    // 所以要借助legacyCreateRootFromDOMContainer创建container._reactRootContainer属性/root
    root = container._reactRootContainer = legacyCreateRootFromDOMContainer(
      container,
      forceHydrate,
    );
    // 获取fiberRoot
    fiberRoot = root._internalRoot;
    if (typeof callback === 'function') {
      const originalCallback = callback;
      callback = function () {
        const instance = getPublicRootInstance(fiberRoot);
        originalCallback.call(instance);
      };
    }
    // 首次挂载不进行批量更新
    unbatchedUpdates(() => {
      updateContainer(children, fiberRoot, parentComponent, callback);
    });
  } else {
    // 这里的更新是非首次渲染，即普通更新
    fiberRoot = root._internalRoot;
    if (typeof callback === 'function') {
      const originalCallback = callback;
      callback = function () {
        const instance = getPublicRootInstance(fiberRoot);
        originalCallback.call(instance);
      };
    }
    // 无论是首次渲染还是更新渲染，都会调用updateContainer方法，这个方法是react-reconciler的API
    // 在这里不做过多讲解，在这里只要记住通过schedule机制最终将fiberRoot对象渲染到真实DOM的节点上即可。
    updateContainer(children, fiberRoot, parentComponent, callback);
  }
  return getPublicRootInstance(fiberRoot);
}

// 第二步：基于当前的DOM挂载点创建React Root
function legacyCreateRootFromDOMContainer(
  container: Container,
  forceHydrate: boolean,
): RootType {
  // 是否需要Hydrate
  const shouldHydrate =
    forceHydrate || shouldHydrateDueToLegacyHeuristic(container);
  // 如果是不需要就是客户端渲染，
  if (!shouldHydrate) {
    let warned = false;
    let rootSibling;
    // 将container节点内的所有已存在的子节点的全部删除
    while ((rootSibling = container.lastChild)) {
      container.removeChild(rootSibling);
    }
  }
  // 在这里需要说明一下，如果是服务端渲染，React不删除子节点DOM的原因，在于复用已有DOM提高渲染性能。
  // 这里的createLegacyRoot位于ReactDOMRoot.js文件中
  return createLegacyRoot(
    container,
    shouldHydrate? {hydrate: true}: undefined,
  );
}
```

我们可以看下React是如何创建root的
```js
// 首先调用createLegacyRoot
export function createLegacyRoot(
  container: Container,
  options?: RootOptions,
): RootType {
   // 返回的是ReactDOMBlockingRoot实例化对象，只所以返回的是实例化对象的原因，在于
   // ReactDOMBlockingRoot是往调用createLegacyRoot的对象上挂载_internalRoot属性
   // 即root对象。这里的LegacyRoot是一个写死的常数值0
  return new ReactDOMBlockingRoot(container, LegacyRoot, options);
}

function ReactDOMBlockingRoot(container,tag,options) {
  // 赋值root._internalRoot 属性值，也就是最终的fiberRoot对象
  this._internalRoot = createRootImpl(container, tag, options);
}
// 创建Root实例，React的Root分为两种：1. LegacyRoot；2.Concurrent，大多数情况都是LegacyRoot
function createRootImpl(container,tag,options) {
  ...
  // createContainer的工作并不在ReactDOM库中进行，而是第三方库react-reconciler的API
  // 返回我能最终的root对象
  const root = createContainer(container, tag, hydrate, hydrationCallbacks);
  // 在当前挂载的节点中标注为根节点，代码位于ReactDOMComponentTree上，不做赘述
  markContainerAsRoot(root.current, container);
  const containerNodeType = container.nodeType;
  ...
  return root;
}
```

## createRootImpl（附加了解）
上面创建root对象的时候我们看到源码中使用了`createContainer`这个函数，这个函数并非是React-DOM库中的方法，而**react-reconciler**库中的方法，位于`react-reconciler/src/ReactFiberReconciler`。尽管本章节并非讲解**react-reconciler**,但是由于涉及到这个方法暂时提及一下：

```js
export function createContainer(containerInfo,tag,hydrate,hydrationCallbacks) {
  return createFiberRoot(containerInfo, tag, hydrate, hydrationCallbacks);
}
// 位于ReactFiberRoot.new.js
export function createFiberRoot(containerInfo,tag,hydrate,hydrationCallbacks) {
  // 有关FiberRootNode实例化的具体源码请参考「React源码中的类」一章
  const root = new FiberRootNode(containerInfo, tag, hydrate);
  if (enableSuspenseCallback) {
    root.hydrationCallbacks = hydrationCallbacks;
  }
  const uninitializedFiber = createHostRootFiber(tag);
  root.current = uninitializedFiber;
  uninitializedFiber.stateNode = root;
  // 初始化更新队列
  initializeUpdateQueue(uninitializedFiber);
  // 最终返回Fiber Root
  return root;
}
```

## 总结

有关于ReactDOM渲染这块，我们可以看到reactd-dom高度依赖于**react-reconciler**这个库，就其自身而言，它只判断当前的渲染是客户端还是服务端渲染，根据不同的情况基于FiberRootNode实例化对象，然后更新挂载到真实的DOM上。本章只带大家了解ReactDOM渲染的整个宏观流程，对于具体实现DOM渲染和挂载的细节会在**react-reconciler**中详细讲解。