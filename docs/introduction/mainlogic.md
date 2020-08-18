---
category: 简介
order: 3
title: React的主干逻辑图解
---

React的主干逻辑不同于其他前端库或框架在原生react包中，它的主干逻辑位于`react-reconciler`包中。下面就是整个fiber运算的逻辑图。


<img width="720"
src="https://test-1253763202.cos.ap-shanghai.myqcloud.com/docs/react-source/fiberworkloop.drawio.png"/>

## WorkLoop时Fiber树的遍历顺序

<img width="720"
src="https://test-1253763202.cos.ap-shanghai.myqcloud.com/docs/react-source/workloop.png"/>

