---
category: 其他
order: 4
title: 如何优化Context性能及其底层源码实现
---

Context作为React的新增API面世已经有两年有余，我们可以借助它在不使用Redux的情况下创建一个全局store。在平时业务代码中经常会使用到，但是它是否会有性能优化的空间？它在源码中又是如何实现的？

下面这是一个平淡无奇的React业务代码：

```js
const store = {
  state = {
    foo: 1,
    bar: 1,
  },
  update(cb) {
    this.state = cb(this.state);
  }
};

const {Provider, Consumer} = React.createContext(store.state);
const Foo = () => (
  <Consumer>
    {({foo, update}) => (
      <div>
        <button
          onClick={() =>
            update((state) => ({...state, foo: state.foo + 1}))
          }
        >
          click
        </button>
        <p>Foo is {foo}</p>
      </div>
    )}
  </Consumer>
);
const Bar = () => (
  <Consumer>
    {({bar, update}) => (
      <div>
        <button
          onClick={() =>
            update((state) => ({...state, bar: state.bar + 1}))
          }
        >
          click
        </button>
        <p>Bar is {bar}</p>
      </div>
    )}
  </Consumer>
);
const App = () => (
  <Provider value={store.state}>
    <Foo />
    <Bar />
  </Provider>
);
```

无论我们在哪个组件中都可以使用到全局store对象，看起来是不是超酷？但是这里却有着巨大的性能浪费，当我们在`<Foo/>`组件点击按钮时尽管我们更新了全局store，但是会导致整个应用其他组件的一起更新，如果只是一般的小型应用这没什么，但是要是大型应用显然，这会造成非常大的性能伤害。为了解决这个问题React在Context放置了一个隐藏的unstable特性：**ObservedBits**。

现在我们一起来通过**ObservedBits**来优化这段代码：

```js
const store = {
+  observedBits: {
+    foo: 0b01,
+    bar: 0b10
+  },
  state = {
    foo: 1,
    bar: 1,
  },
  update(cb) {
    this.state = cb(this.state);
  }
};

const StoreContext = React.createContext(store.state,  
+  (prev, next) => {
+    let result = 0;
+    if (prev.foo !== next.foo) {
+      result |= store.observedBits.foo;
+    }
+    if (prev.bar !== next.bar) {
+      result |= store.observedBits.bar;
+    }
+    return result;
+  }
);
```

在上面的代码中，我们在store全局对象中添加了`observedBits`该属性通过bit掩码值对`state`中的字段进行了映射。又在`React.createContext()`中添加了一个箭头回调函数，用以监听哪个字段的值发生了变动。假设`state.bar`发生了变动,则返回`0b10`。

> 未来的React17源码会大量地使用到bit掩码计算，针对这一趋势希望大家能够注意。

## 如何在Consumer组件中设置观察者模式

在上面的代码中吗，我们已经在`React.createContext()`中配置好了监听，那么对于组件来说它如何根据监听的结果，决定自己是否应该更新呢？我们可以通过`unstable_observedBits`属性给`<Consumer/>`组件设置观察者模式：

```js
const Foo = () => (
  <Consumer 
  // 只观察与自己组件相关的变量即可
  unstable_observedBits={store.observedBits.foo}>
    {({foo, update}) => (
      <div>
        <button
          onClick={() =>
            update((state) => ({...state, foo: state.foo + 1}))
          }
        >
          click
        </button>
        <p>Foo is {foo}</p>
      </div>
    )}
  </Consumer>
);
const Bar = () => (
  <Consumer 
  // 这里也一样
  unstable_observedBits={store.observedBits.bar}>
    {({bar, update}) => (
      <div>
        <button
          onClick={() =>
            update((state) => ({...state, bar: state.bar + 1}))
          }
        >
          click
        </button>
        <p>Bar is {bar}</p>
      </div>
    )}
  </Consumer>
);
```

这个时候每一次全局变量的更新React就只渲染相关的组件了。对于初中级的前端开发者看到这里基本上就够了。对于高级前端开发者，就应该了解它的底层源码是如何实现的。


## React.createContext()在源码中的实现

```js
export function createContext(defaultValue, calculateChangedBits) {
  // 这里的calculateChangedBits就是我们上面监听全局store的箭头回调函数
  if (calculateChangedBits === undefined) {
    calculateChangedBits = null;
  }

  const context = {
    $$typeof: REACT_CONTEXT_TYPE,
    _calculateChangedBits: calculateChangedBits,
    // 在React中对于渲染器有着级别之分，分为PrimaryRenderer和SecondaryRenderer。
    // ReactNative和ReactDOM就是PrimaryRenderer，返回的值_currentValue
    _currentValue: defaultValue,
    // 对于SecondaryRenderer渲染环境返回的值_currentValue2
    _currentValue2: defaultValue,
    _threadCount: 0,    // 用于跟踪在单个renderer及当前context中有多少并发renderers，比如并发服务端渲染
    Provider: null,
    Consumer: null
  };
  // 我们在业务代码中使用到的<Provider/><Consumer/>两个组件都会包含context自身信息
  context.Provider = {
    $$typeof: REACT_PROVIDER_TYPE,
    _context: context
  };
  context.Consumer = context;
  return context;
}
```



下面是`<Cunsumer/>`在React Fiber中的执行顺序:

```js
workLoopSync() // 假设是普通的同步的工作循环
|
|
performUnitOfWork() // 从根节点开始开始运行workInProgress Fibers链表
|
|
beginWork() // 递归中遇到某个workInProgress Fiber的tag类型为ContextConsumer
|
|
updateContextConsumer(current, workInProgress, renderLanes) // 运行核心更新方法
```

我们现在看下`updateContextConsumer`中都干什么？

```js
function updateContextConsumer(current,workInProgress,renderLanes) {
  let context = workInProgress.type;
  const newProps = workInProgress.pendingProps;
  const render = newProps.children;
  // 准备读取context
  prepareToReadContext(workInProgress, renderLanes);
  // 读取context
  const newValue = readContext(context, newProps.unstable_observedBits);
  let newChildren;
  newChildren = render(newValue);
  // diff子节点
  reconcileChildren(current, workInProgress, newChildren, renderLanes);
  // 将当前更新的workInProgress fiber 的 child也就是当前consumer返回
  return workInProgress.child;
}
```
----

`prepareToReadContext`和`readContext`虽然是两个函数，但是有着紧密的连续。我们看下它内部的细节：

```js
export function prepareToReadContext(workInProgress, renderLanes) {
  // 设置当前正在渲染的fiber，后面readContext会用到
  currentlyRenderingFiber = workInProgress;
  lastContextDependency = null;
  lastContextWithAllBitsObserved = null;

  const dependencies = workInProgress.dependencies;
  if (dependencies !== null) {
    const firstContext = dependencies.firstContext;
    if (firstContext !== null) {
      if (includesSomeLane(dependencies.lanes, renderLanes)) {
        // Context list has a pending update. Mark that this fiber performed work.
        markWorkInProgressReceivedUpdate();
      }
      // Reset the work-in-progress list
      dependencies.firstContext = null;
    }
  }
}

export function readContext(context, observedBits) {
  if (lastContextWithAllBitsObserved === context) {
    // Nothing to do. We already observe everything in this context.
  } else if (observedBits === false || observedBits === 0) {
    // 对于大多数情况下consumer组件中是没有设置observedBits的，这种情况你会发现这里什么都不会做
  } else {
    let resolvedObservedBits; // Avoid deopting on observable arguments or heterogeneous types.
    if (
      typeof observedBits !== 'number' ||
      observedBits === MAX_SIGNED_31_BIT_INT
    ) {
      // Observe all updates.
      lastContextWithAllBitsObserved = context;
      resolvedObservedBits = MAX_SIGNED_31_BIT_INT;
    } else {
      resolvedObservedBits = observedBits;
    }

    const contextItem = {
      context: context,
      observedBits: resolvedObservedBits,
      next: null,
    };

    if (lastContextDependency === null) {
      // This is the first dependency for this component. Create a new list.
      lastContextDependency = contextItem;
      currentlyRenderingFiber.dependencies = {
        lanes: NoLanes,
        firstContext: contextItem,
        responders: null,
      };
    } else {
      // Append a new context item.
      lastContextDependency = lastContextDependency.next = contextItem;
    }
  };

  // 要确认是否是首次渲染，
  return isPrimaryRenderer ? context._currentValue : context._currentValue2;
}

```


参考资料：https://medium.com/@koba04/a-secret-parts-of-react-new-context-api-e9506a4578aa