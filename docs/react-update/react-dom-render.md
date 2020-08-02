---
category: React API
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

## 总结

