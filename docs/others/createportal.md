---
category: 其他
order: 8
title: 什么是Portal？
---

Portal是一种在父组件的主要DOM层次结构之外, **在保留Context前提之下**，呈现React子组件的方法。我强调这一点是因为非常流行的库（例如react-router，redux）大量使用react上下文。因此，使用Portal时上下文的可用性非常有帮助。 根据反应文档，

对于这种脱离DOM层次结构的组件，在日常业务代码中非常常见，如：dialogs，hovercards，tooltip。

我们可以在当前DOM树之外创建一个平行DOM树。

```js
<html>
    <body>
        <div id="root"></div>
        <div id="another-root"></div>
    </body>
</html>

// index.jsx
class HelloFromPortal extends React.Component {
    render() {
         return (
           <h1>I am rendered through a Portal.</h1>
         );
    }
}

class App extends React.Component {
    render() {
        return (
             <div>
                 <h1>Hello World</h1>
                 { ReactDOM.createPortal(<HelloFromPortal />, document.getElementById('another-root')) }
             </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('root'));
```

在上面的代码上我们可以看到，在HTML上我们创建了`id`和`another-root`两个真实DOM。尽管`ReactDOM.createPortal()`在`id`DOM中渲染，但是它的vitual DOM的构建却基于`another-root`div。
