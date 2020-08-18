---
category: 简介
order: 4
title: JSX与React.js的关系
---

不同于Vue有自己的模板，通过编译将业务模板代码编译成JS代码，但是对于React而言，它并不存在模板这一概念。绝大多数的React的业务代码都是使用JSX格式编写代码，它相较于原生JS的唯一区别就是可以在其文件中编写类HTML标签，然后通过babel的react插件编译将其转换为原生JS代码。

假设我们在`App.jsx`编写业务代码：

```js
function App(){
  return(
    <div id="root" key={1}>
        <span>Hello</span>
         <span>World</span>
    </div>
  )
}
```

编译之后的代码：

```js
React.createElement("div",{id:"root",key:1},
  React.createElement("span",null,"Hello"),
  React.createElement("span",null,"World"),
)
```
在上面的代码中我们可以看到JSX文件中嵌套的类HTML标签编译成了一个基于`React.createElement`
的树状结构。

<img src="https://test-1253763202.cos.ap-shanghai.myqcloud.com/docs/react-source/dom_tree.png" style="width:100%" alt="树架构"/>

## 组件的编译

显然，我们在实际业务代码中没有这么简单。我们在业务开发中经常会自定义组件。那么组件的编译又有和不同？

```js
function Hello(){
  return (
      <span>Hello</span>
  )
}

function App(){
  return(
    <div id="root" key={1}>
        <Hello/>
    </div>
  )
}
```

babel编译之后：

```js
function Hello(){
  return React.createElement("span",null,"Hello");
}

React.createElement("div",{id:"root",key:1},
  React.createElement(Hello),
)
```

## 总结

Babel的React插件在编译的过程中会根据标签的首字母是否大写来判断该标签是原生HTML标签还是开发者自定义的组件。尽管`React.createElement()`并不会出现在业务代码中，但是开发者要谨记它React开发中最常用的API。