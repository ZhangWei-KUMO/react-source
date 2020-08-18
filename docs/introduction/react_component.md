---
category: 简介
order: 6
title: React Component
---

Component是React最直观的概念，React中所有类型的Component，都是继承于`React.Component`这个函数。

Component核心代码位于`ReactBaseClasses.js`，实际代码量非常小，是一个典型的原型链继承:

 ```js
import invariant from 'shared/invariant';
import ReactNoopUpdateQueue from './ReactNoopUpdateQueue';
const emptyObject = {};
// 最基础的Component，对于props，context就不必多说，作为React的开发人员应该非常熟悉
// 这里的updater，是指不同平台（RN或React-DOM）的更新器，
function Component(props, context, updater) {
  this.props = props;
  this.context = context;
  this.refs = emptyObject;
  this.updater = updater || ReactNoopUpdateQueue;
}
// 这个属性没怎么用，直接忽略
Component.prototype.isReactComponent = {};

// 我们可以看到React的setState和forceUpdate，实际都是在调用
// this.updater.enqueueSetState方法，
// 这个方法调用的是React-DOM或React Native的方法，和React没有关系，这是由于不同的平台渲染
// 流程并不相同。
Component.prototype.setState = function(partialState, callback) {
  this.updater.enqueueSetState(this, partialState, callback, 'setState');
};
// forceUpdate 业务代码中少用慎用
Component.prototype.forceUpdate = function(callback) {
  this.updater.enqueueForceUpdate(this, callback, 'forceUpdate');
};

function ComponentDummy() {}
ComponentDummy.prototype = Component.prototype;


function PureComponent(props, context, updater) {
  this.props = props;
  this.context = context;
  this.refs = emptyObject;
  this.updater = updater || ReactNoopUpdateQueue;
}

const pureComponentPrototype = (PureComponent.prototype = new ComponentDummy());
pureComponentPrototype.constructor = PureComponent;
Object.assign(pureComponentPrototype, Component.prototype);
// 标注了一个isPureReactComponent属性
pureComponentPrototype.isPureReactComponent = true;

export {Component, PureComponent};
 ```

 ## 总结

 如果只是看`ReactBaseClasses.js`的源码，很多会觉得Component非常简单。如`Component`和`PureComponent`除了更新及`isPureReactComponent`属性上，没有任何区别，就是两个非常简单的构造函数。而在更新上调用的方法则由是第三方库的方法。那么这是为什么呢？ 先保留这个疑问，在第二章：**React的更新**中，我们会基于React-DOM源码进行解析。