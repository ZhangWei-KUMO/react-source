---
category: React API
order: 1
title: React Element
---

React Element是由`React.createElement()`创建出来的元素，是React的核心API。我们现在从React源码开始。我们首先打开`React.js`这个核心文件，由于篇幅的关系我这里会省略不涉及的内容。

```js
import ReactVersion from 'shared/ReactVersion';
import {
  REACT_FRAGMENT_TYPE,
  ...
} from 'shared/ReactSymbols';
// 可以看到源码中集成了大量我们在React开发中常用的API
import {Component, PureComponent} from './ReactBaseClasses';
import {createRef} from './ReactCreateRef';
import {
  // 在上一章中，我们介绍过createElement，本章就围绕ReactElement.js开始
  createElement as createElementProd,
  ...,
} from './ReactElement';
...
import {
  useCallback,
  ...
} from './ReactHooks';
...

// 在这里的export的对象就是React对象，下面的这些属性都是React暴露给开发者所使用的API
export {
  Children,
  Component,
  PureComponent,
  ...
};

```

打开`ReactElement.js`

```js
import getComponentName from 'shared/getComponentName';
import invariant from 'shared/invariant';
import {REACT_ELEMENT_TYPE} from 'shared/ReactSymbols';

import ReactCurrentOwner from './ReactCurrentOwner';
// React的四大保留属性，也就是不属于React开开发中自定义props对象中的属性；
const RESERVED_PROPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true,
};

/**
 * 我们直接找到createElement方法，这里定义了三个参数：type, config, children)
 * type表示节点声明的类型，如果是原生HTML type是字符串，如果是自定义组件，如：Component， 
 * PureComponent，functional Component，那它就是一个Symbol实例。
 * config对象就是我们在标签中所定义的所有字段属性。
 * children 可能是textContent或者子标签
 */

export function createElement(type, config, children) {
  let propName;
  // React中的props对象
  const props = {};
  // 定义React四大保留属性，也就是 RESERVED_PROPS
  let key = null;
  let ref = null;
  let self = null;
  let source = null;
  // 创建React元素的第一步：处理config
  if (config != null) {
    // 抽离出开发者定义的ref和key属性进行单独
    if (hasValidRef(config)) {
      ref = config.ref;
    }
    if (hasValidKey(config)) {
      key = '' + config.key;
    }
    // 实际业务代码中极少用到self和source字段，故在此省略
    self = config.__self === undefined ? null : config.__self;
    source = config.__source === undefined ? null : config.__source;
    // 对于其他开发者自定义的props进行遍历
    for (propName in config) {
      if (
        // 确认两件事：1. 配置中存在该字段；2. 该属性不属于RESERVED_PROPS
        hasOwnProperty.call(config, propName) &&
        !RESERVED_PROPS.hasOwnProperty(propName)
      ) {
        // 赋值
        props[propName] = config[propName];
      }
    }
  }

  // 第二步：创建children，首先确认children参数传递的正确性。
  // 尽管我们在函数声明中之有三个参数，但是在JS代码的理论上是可以传递多个参数
  const childrenLength = arguments.length - 2;
  // 假设传递参数的数量符合函数定义
  if (childrenLength === 1) {
    // 直接赋值给props即可
    props.children = children;
  } else if (childrenLength > 1) {
    // 如果传递多个参数，基于当前参数数量创建一个空数组
    const childArray = Array(childrenLength);
    // 从第三个参数开始遍历
    for (let i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    // 以数组的形式赋值props对象
    props.children = childArray;
  }

  // 下面这段代码是对于class Component的defaultProps的处理，尽管自15.5版本之后defaultProps已经被
  // PropTypes所取代，但是React的源码中依然保留了这段源码
  if (type && type.defaultProps) {
    const defaultProps = type.defaultProps;
    for (propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName];
      }
    }
  }
// 第三步：返回ReactElement函数
  return ReactElement(
    type,
    key,
    ref,
    self,
    source,
    ReactCurrentOwner.current,
    props,
  );
}

const ReactElement = function(type, key, ref, self, source, owner, props) {
  const element = {
    // React元素的类型标识符
    $$typeof: REACT_ELEMENT_TYPE,
    type: type,
    key: key,
    ref: ref,
    // 开发中自定义props
    props: props,
    // 当前元素所属的父级元素
    _owner: owner,
  };
  // 到了这里一个简单的React元素就创建完成了
  return element;
};
...

function hasValidRef(config) {
  return config.ref !== undefined;
}

function hasValidKey(config) {
  return config.key !== undefined;
}
```

## 总结

通过对`ReactElement.js`源码的阅读，我们会发现React的元素从本质上来说就是一个简单的JS对象，它有两个内置的属性: `$$typeof`,`_owner`和一个基于组件类型的`type`属性用于源码底层, 以及三个开发层面的属性：`key`,`ref`,`props`。尽管从形式上极为简单，但是它是React的核心架构，也是后续形成DOM的源头。对于高级React开发人员，本章内容需要烂熟于心。

