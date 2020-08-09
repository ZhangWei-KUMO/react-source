---
category: 其他
order: 1
title: symbol 在 React中应用
---

**Symbol**是JavaScript ES6+版本的基础数据类型，它的特点如下：

1. 不是构造函数，不存在`new Symbol()`;
2. 有一个特殊的**全局注册表**概念;
3. 具有静态类型和静态方法;
4. 它创建一个匿名，唯一的值

比如我们现在创建一个对象，我们希望它内部所有的key都是具有唯一性：

```js
const CN = Symbol("China");
const US = Symbol("United State");
const JS = Symbol("Japan");
const countries = {
  [CN]: "中国",
  [US]: "美国",
  [JS]: "日本"
}

console.log(countries[CN])
```

表面上我们输出了`中国`，但是这里的`CN`每次调用的时候值是不同的。


## React中的Symbol

React中有一个`ReactSymbols.js`文件，我们可以看下它的源码：

```js
// 在React的设计中对于支持Symbol的浏览器，它会将各种各样的组件类型放入Symbol注册表中，
// 对于老旧浏览器则赋值一个32位数位值
// 针对老旧浏览器，先初始化声明一个值。
export let REACT_ELEMENT_TYPE = 0xeac7;
...
// 现代浏览器的情况下
if (typeof Symbol === 'function' && Symbol.for) {
  // 抽离出Symbol.for方法
  const symbolFor = Symbol.for;
  // 基于'react.element'的key在全局Symbol注册表中创建一个新的symbol
  REACT_ELEMENT_TYPE = symbolFor('react.element');
  ...
}

const MAYBE_ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
const FAUX_ITERATOR_SYMBOL = '@@iterator';

export function getIteratorFn(maybeIterable =>{
  if (maybeIterable === null || typeof maybeIterable !== 'object') {
    return null;
  }
  const maybeIterator = (MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL]) ||
    maybeIterable[FAUX_ITERATOR_SYMBOL];
  if (typeof maybeIterator === 'function') {
    return maybeIterator;
  }
  return null;
}
```

尽管`Symbol.for()`和`Symbol()`两种写法都可以生成一个新的Symbol(),但是`Symbol.for()`会将参数注册到全局注册表中，供搜索。

```js
// 尽管常量A_TYPE和常量B_TYPE的值都是Symbol("react.element")
// 但是Symbol.for("react.element")在全局注册表注册key"react.element"
const A_TYPE = Symbol.for("react.element");
const B_TYPE = Symbol("react.element");

const A_VALUE = Symbol.keyFor(A_TYPE);
// 我们可以通过keyFor方法查询到 "react.element"
const B_VALUE = Symbol.keyFor(B_TYPE);
// 而对于B_VALUE来说则输出undefined
console.log(A_VALUE, B_VALUE);
```

