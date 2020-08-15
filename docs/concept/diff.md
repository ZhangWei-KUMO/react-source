---
category: React基础概念
order: 5
title: diff算法
---

diff算法是一个非常常见的算法，传统的diff算法的复杂度是 O(n^3)，这种复杂度对于前端渲染是不可接受的。假设我们在一个单页应用中有1000个节点需要渲染，那么就需要10亿次计算。这个对于前端性能消耗是非常可怕的。

> 注：这里的n表示tree中的节点数量，在React中diff分为：1. tree diff; 2. component diff; 3. element diff 三种。

所以React的diff算法在原有的基础之上做了策略改进，其**目标是将 O(n^3)复杂度降为O(n)**。它对于diff算法做了三个预设性策略：

1. Tree diff 只在同级元素之间做diff；
2. 不同类型的元素生成不同的Tree；
3. 在业务代码中设置保留属性key确保渲染稳定性。

## 策略一：tree diff计算时只进行同级元素diff

对于大多数应用来说，页面的DOM结构是非常稳定的，DOM之间的关系并不会出现结构性变动。基于这个前提React对于diff算法的优化策略之一就是，在更新的是时候对于DOM树进行同层级比较。假设我们这里有两颗DOM树：

```js
// DOM TREE 1
<div>
  <p>
    <span>
    黑命贵
    </span>
  </p>
  <h2></h2>
</div>

// DOM TREE 2
<div>
  <p></p>
  <h2></h2>
</div>
```

当我们对比到`span`标签这一层的时候，React会发现`span`标签已经不存在,在这个时候React便不会再继续向下diff计算，直接将`span`以下的节点全部删除，这样只需对DOM树进行一次遍历就可完成diff比较。

当然可能有人会说，DOM结构性变动并非没有可能，比方说我们常见的拖拽组件的应用，它的DOM结构就会发生经常变动。这种变动我们称为**跨层级DOM移动操作**。还是上面这个例子，假设`span`标签是可拖拽组件，我们现在将其从p标签中拖拽到h2标签中。

```js
<div>
  <p></p>
  <h2>
    <span>
    黑命贵
    </span>
  </h2>
</div>
```

那么此时对于React底层来说发生了什么？React在做diff计算的时候在左子树中发现`p`标签下已经没有`span`标签,会将`span`及其子元素全部销毁，而在右子树中会发现`h2`标签中多了`<span>黑命贵</span>`, 此时React会先创建`span`元素，然后再创建`黑命贵`文本。

通过上面的例子我们可以看出当DOM出现结构性变动的时候，React会以`span`标签为root重新创建一个新Tree，如果这个子树结构比较深、元素比较多。对于React的整体性能的开销会非常大。从某种程度上来说，React不适合DOM结构性改变比较大的应用场景。


## 策略二: component diff计算时不同类型的组件生成不同的Tree

从业务代码的角度来看，整个React的应用是由一堆组件堆积而成。在组件类型相同的情况整个Virtual DOM Tree不会发生任何变化，但是一旦其中某个组件的类型发生了变化，component diff计算时就会将其标注为`dirty component`, 也称为“脏组件”，React会销毁掉`dirty component`所有子节点，生成一个新树替换它。这个设计思想在Angular1时代的脏检查时便已经存在。

## 策略三: 用保留属性key确保DOM的稳定性复用性

在编写React业务代码时，React会经常提示开发人员添加`key`属性确保当前元素的唯一性。尤其是在map遍历生成子节点的时候，必须添加`key`值。尽管我们经常使用，但是很多人并不知道为何？

我们看下面一个案例：

```js
// 更新前
<div>
  <p>黑</p>
  <h3>人</h3>
  <p>命</p>
  <h3>贵</h3>
</div>
// 更新操作
<div>
  <h3>人</h3>
  <p>黑</p>
  <h3>贵</h3>
  <p>命</p> 
</div>
```

在没有key的情况下，当DOM树发生变动时React只会执行简单的销毁、创建元素的动作，显然对于只是顺序发生变动，更新前的元素可以复用的情况是不合理的。所以我们给可能复用的元素添加key值

```js
<div>
  <p key="1">黑</p>
  <h3 key="2">人</h3>
  <p key="3">命</p>
  <h3 key="4">贵</h3>
</div>
```

这样当顺序发生变动时，React仅仅做顺序调整即可。

# Fiber Diff算法的实现

在React的源码中，`ReactChildFiber.js`是diff算法的入口文件,`reconcileChildFibers`函数是入口函数。


```js
  function reconcileChildFibers(
    returnFiber,
    currentFirstChild,
    newChild,
    lanes,
  ){
    // reconcileChildFibers并非是一个递归函数
    // 如果其第一层所传入的newChild参数是一个数组，我们之间将其视为一组子fiber而非fragment
    // 但是如果是内嵌数组，则视为fragment
    // 在一般情况下会出现递归

    // 检查当前newChild是否是一个fragment
    const isUnkeyedTopLevelFragment =
      typeof newChild === 'object' &&
      newChild !== null &&
      newChild.type === REACT_FRAGMENT_TYPE &&
      newChild.key === null;
    if (isUnkeyedTopLevelFragment) {
      newChild = newChild.props.children;
    }

    const isObject = typeof newChild === 'object' && newChild !== null;
    // 如果传入的newChild是一个对象
    if (isObject) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          // 单点元素节点diff
          return placeSingleChild(
            reconcileSingleElement(
              returnFiber,
              currentFirstChild,
              newChild,
              lanes,
            ),
          );
        case REACT_PORTAL_TYPE:
          // 单portal节点diff
          return placeSingleChild(
            reconcileSinglePortal(
              returnFiber,
              currentFirstChild,
              newChild,
              lanes,
            ),
          );
        case REACT_LAZY_TYPE:
          if (enableLazyElements) {
            const payload = newChild._payload;
            const init = newChild._init;
            // 非递归函数
            return reconcileChildFibers(
              returnFiber,
              currentFirstChild,
              init(payload),
              lanes,
            );
          }
      }
    }

    // 如果newChild 是string和number类型，则进行单文本节点diff
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      return placeSingleChild(
        reconcileSingleTextNode(
          returnFiber,
          currentFirstChild,
          '' + newChild,
          lanes,
        ),
      );
    }

    // 如果newChild是一个数组
    if (isArray(newChild)) {
      return reconcileChildrenArray(
        returnFiber,
        currentFirstChild,
        newChild,
        lanes,
      );
    }

    if (getIteratorFn(newChild)) {
      return reconcileChildrenIterator(
        returnFiber,
        currentFirstChild,
        newChild,
        lanes,
      );
    }

    if (isObject) {
      // 如果是位置react type则报错，这个略过...
      throwOnInvalidObjectType(returnFiber, newChild);
    }

    ...

    // 其余的皆删除
    return deleteRemainingChildren(returnFiber, currentFirstChild);
  }

  return reconcileChildFibers;
}

```

## 总结

本文我们看到了React diff算法的递归全过程，但是有关于diff的细节我们并没有进行讨论。所有我们开始一下节——《单一节点的diff》。