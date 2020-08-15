---
category: React DOM
order: 2
title: React DOM render
---

在React中对于渲染器有着级别之分，分为**PrimaryRenderer**和**SecondaryRenderer**。

在浏览器端：

* ReactDOM是PrimaryRenderer
* ReactART是SecondaryRenderer（用于绘制Canvas和SVG）

在移动端：

* React Native是PrimaryRenderer
* Fabric 是SecondaryRenderer
  
所有的React开发者接触react都是从`reactDOM.render()`这个方法开始的。下面就是一段非常常见的业务代码：

```js
ReactDOM.render(<App/>,documemt.getElementById('root'))
```

那么这段业务代码的的背后发生了什么？和它极为相似的`reactDOM.hydrate()`在源码中的区别是什么？

这个两个函数定义在`ReactDOMLegacy.js`中，我们从源码中看它们到底发生了什么？

```js
export function hydrate(element, container, callback) {
  return legacyRenderSubtreeIntoContainer(
    null,
    element,
    container,
    true,
    callback,
  );
}

export function render(element, container, callback) {
  return legacyRenderSubtreeIntoContainer(
    null,
    element,
    container,
    false,
    callback,
  );
}
```

我们神奇地发现二者调用的函数都是一个`legacyRenderSubtreeIntoContainer`,只是在第四个参数标注是否为服务端渲染上布尔值不同。看来搞懂这个函数才是重点，从名字上看叫**渲染子树到容器中**。

```js
function legacyRenderSubtreeIntoContainer(
  parentComponent, // 从上面代码中知道这里传的值为null，因为root节点不存在父级组件
  children, // 传入子元素，业务代码中通常为<App/>
  container, // 容器，业务代码中通常为document.getElementById('root')
  forceHydrate, // 本文以render函数为主题，所以为false
  callback, // 一般情况我们极少在业务代码中写回调函数我们在这里忽略
) {
  // 从container对象中获取私有属性_reactRootContainer，从业务代码中我们得知
  // 这就是一个id为root的真实dom对象，哪里来的_reactRootContainer属性？
  // 所以在初始渲染的时候root是不存在的
  let root = container._reactRootContainer;
  // 定义一个fiberRoot变量，它是React fiber树的根，也是所有的虚拟DOM的集合对象
  let fiberRoot;
  if (!root) {
    // 因为root不存在，我们现在要基于这个真实DOM创建root，这个对象中有一个指针属性_internalRoot
    // 上面挂载了整个fiber树，同时会给真实DOM添加一个私有属性__reactContainer$randomKey，
    // 表示它是当前React项目的容器
    root = container._reactRootContainer = legacyCreateRootFromDOMContainer(
      container,
      forceHydrate,
    );
    // 拿出fiber树
    fiberRoot = root._internalRoot;
    // 首次渲染不执行批量渲染
    unbatchedUpdates(() => {
      // 更新整个react容器，整个fiberRoot的对象树会被整体构建，
      updateContainer(children, fiberRoot, parentComponent, callback);
    });
  } else {
    // 之后的更新渲染由于已经有了root对象，直接拿虚拟fiber DOM树就好了
    fiberRoot = root._internalRoot;
     // 更新整个react容器，整个fiberRoot的对象树会被整体更新
    updateContainer(children, fiberRoot, parentComponent, callback);
  }
  // 返回这个fiberRoot对象
  return getPublicRootInstance(fiberRoot);
}
```

## 最终的渲染

`ReactDOM.render()`只是编写在jsx文件中的函数，对于`react-dom`库来说它一不负责diff算法，二不负责dom绘制。它只负责在`fiberNode`和`浏览器DOM`之间做一个桥接，告诉`react-reconciler`库你该如何更新fiber树，然后把新的fiber树还我。在拿到新的fiber树后，它会通过babel抽取AST语法树将代码编写成`React.createElement()`形式，最后生成真实DOM渲染到浏览器上。

## 总结

通过本文我们可以清楚地看到整个`react-dom`库的工作流程，也知道`react-dom`库与`react-reconciler`库,`react`库和babel编译器之间的关系。当然其中还有很多细节需要大家自己去深入了解，如：如何基于真实DOM容器构建fiber对象？什么是批量更新？更新fiber的细节是什么？
