---
category: 其他
order: 5
title: Component和PureComponent
---

一个React应用是由若干个Component所组成，Component组成了ReactUI一个个部分。但是如果我们打开Component的源码会发现它的代码非常简单，一共只有两个函数`Component`和`PureComponent`，从构造函数角度二者一模一样。它们之间的区别在于：

1. **Component**和**PureComponent**拥有各自标签属性：`isReactComponent`和`isPureReactComponent`；
2. Component原型链上有`setState`方法。

下面就是它们的代码：

```js
const emptyObject = {};
function Component(props, context, updater) {
  this.props = props;
  this.context = context;
  this.refs = emptyObject;
  // 初始化默认使用的更新器，但是在实际运行中React组件的更新是由Renderer执行的。
  // 这里的updater是一个占位符，在实际React-reconciler库中，ReactFiberClassComponent会对其重新赋值。
  this.updater = updater || ReactNoopUpdateQueue;
}

Component.prototype.isReactComponent = {};
// 在Component原型链上添加setState方法
Component.prototype.setState = function (partialState, callback) {
  this.updater.enqueueSetState(this, partialState, callback, 'setState');
};
// 创建一个空函数
function ComponentDummy() { }
// 将Component的原型链复制到空函数的原型链上
ComponentDummy.prototype = Component.prototype;

// 创建PureComponent构造函数
function PureComponent(props, context, updater) {
  this.props = props;
  this.context = context;
  this.refs = emptyObject;
  this.updater = updater || ReactNoopUpdateQueue;
}

// 将空函数的实例化对象挂载到PureComponent原型链上
const pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
pureComponentPrototype.constructor = PureComponent;
// 将两个原型链合并
Object.assign(pureComponentPrototype, Component.prototype);
pureComponentPrototype.isPureReactComponent = true;

export { Component, PureComponent };
```

## ReactFiberClassComponent

熟悉React代码的朋友都知道ClassComponent比起函数组件和PureComponent，它最大的特点就是拥有一个setState用以更新其内部的状态，更新这个功能并不是在react这个库中实现的而是react-reconciler库中的ReactFiberClassComponent对象来实现的。

这个对象的暴露了五个方法：

```js
export {
  adoptClassInstance, // 使用class组件实例
  constructClassInstance, // 构建class组件实例
  mountClassInstance,  // 挂载class组件实例
  resumeMountClassInstance, // 恢复挂载class组件实例
  updateClassInstance, // 更新class组件实例
};
```


