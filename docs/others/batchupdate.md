---
category: 其他
order: 10
title: batchedUpdates批量更新策略
---

对于了解React原理的同学一定知道React的批量更新策略，说起来很简单，就是在一个同步事件循环（sync-workloop）中执行多次`setState()`时，这些更新任务都会被放入一个批量队列中，等执行完`event handler`后再去更新所有的state。

但是对于异步事件循环（async-workloop）则并不执行批量更新，比如：

```js
nextTick=()=>{
  setTimeout(()=>{
    this.setState({
      count:1
    })
     this.setState({
      count:2
    })
     this.setState({
      count:3
    })
  },2000)
}
```
or

```js
nextTick=()=>{
  fetch("xxx").then(res=>res.json()).then(data1=>{
    this.setState({
      count:data1
    })
  })
   fetch("yyy").then(res=>res.json()).then(data2=>{
    this.setState({
      count:data2
    })
  })
}
```

上面无论是setTimout函数还是fetch网络请求，在nextTick异步事件循环中都是挨个setState的。对于这种情况，React提供了一个unstable API用于强制批量更新：

```js
import ReactDOM, { unstable_batchedUpdates } from "react-dom";
nextTick=()=>{
+  unstable_batchedUpdates(() => {
    setTimeout(()=>{
      this.setState({
        count:1
      })
      this.setState({
        count:2
      })
      this.setState({
        count:3
      })
+    })
  },2000)
}
```

