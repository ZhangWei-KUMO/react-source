---
category: React DOM
order: 5
title: Events
---

处理React Element事件十分类似于处理原生浏览器DOM事件，但二者有着四个重大区别：

1. React Element事件命名规则是驼峰写法，原生DOM事件则是小写;
2. React Element的event handler是function，而元素DOM则是string;
3. 对于元素的默认行为 React event handler必须显式调用`e.preventDefault()`;
4. React Element初始化渲染的时候，就会在其内部生成一个`listerner`,React Element不需要做`addEventListerner`。
   
```js
//原生DOM触发事件
<button onclick="activateLasers()"/>
// React Element触发事件
<button onClick={activateLasers}/>

// 原生<a>触发事件
<a href="#" onclick="console.log('The link was clicked.'); return false">
原生DOM可以通过return false阻止a标签触发默认行为href超链接
</a>

// React<a>触发事件
// 我们可以直接编写函数即可，不需要写dom.addEventListerner()
function ActionLink() {
  function handleClick(e) {
    // handleClick则必须显式调用e.preventDefault()
    e.preventDefault();
    console.log('The link was clicked.');
  }

  return (
    <a href="#" onClick={handleClick}>
      Click me
    </a>
  );
}
```

## handle Event函数中的e是什么？

当我们在触发一个事件之后，该handle Event函数默认会将event作为参数传递进来。熟悉原生DOM的朋友知道在当年的微软和网景的浏览器大战中，关于事件的触发分成了剑宗（冒泡事件）和气宗（捕捉事件）两大派。尽管现在冒泡事件占了上风，但是作为一个可以兼容全浏览器的UI库，React在这个问题上做了合成。

这个e的正式名称为**Synthetic Event**，即合成事件。

如果从React的源码角度来看**Synthetic Event**是一个包含浏览器原生event的跨浏览器的wrapper对象。从语法上开发者四看不出来有什么不同，如：`e.stopPropagation()`、`e.preventDefault()`, 但是它的厉害之处就在于，它作用在所有的浏览器中效果都是一样的。

## React Event是如何做到跨浏览器事件标准化的？

在**冒泡阶段（bubbling parse）**，event handler函数被触发，然后在**捕获阶段（capture parse）**注册这个event handler函数（为了区分在eventname上添加了Capture）。假设这个event handler是click事件，在冒泡阶段它的名称为`onClick`,在捕获阶段的名称就是`onClickCapture`。


## targetListeners registeredReactDOMEvents

**registeredReactDOMEvents**对象利用了WeakSet的特性：**方便对大对象的跟踪对象引用**。