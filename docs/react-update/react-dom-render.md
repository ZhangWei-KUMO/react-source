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

> FiberRoot和RootFiber不是一个概念

我们首先看一段简单的React业务代码：

```js
ReactDOM.render(<App/>,document.getElementById('root'));
```

根据上一章内容，我们可以知道在这里`<App/>`这个组件，会通过`React.createElement()`方法生成一个**树结构**。

<img src="" style="width:100%"/>

## ReactDOM库

**react-dom库是针对浏览器环境独立于react库的第三方库**, 他针对浏览器和Node.js端分别将代码分在了client和server两个文件夹下，本节基于浏览器端，所以我们首先打开`react-dom/src/client/ReactDOM.js`。



## 总结

