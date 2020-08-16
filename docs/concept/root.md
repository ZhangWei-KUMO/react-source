---
category: React基础概念
order: 13
title:  root
---

FiberRoot的六种状态，这只存在于并发模式下：

| 名称                   | 值   | 解释                                                                                                                                                                                                 |
| :--------------------- | :--- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RootIncomplete         | 0    | root在没有生成fiber树之前的状态，下面的     RootFatalErrored  ，RootErrored都是它的子状态。如果一切顺利它会在将相关指针属性如`current.alternate`,`finishedWork`,`finishedLanes` 赋值后，交给渲染函数 |
| RootFatalErrored       | 1    | 致命错误，  这个没什么好说的直接报错                                                                                                                                                                 |
| RootErrored            | 2    | 当出现的root error的时候，react会尝试再次渲染，如何依然失败才会放弃提交commit生成fiber 树，如果在服务端渲染出现root错误，react会放弃服务端渲染，返回客户端渲染                                       |
|                        |
| RootSuspended          | 3    | 它最重要的工作是对root对象进行suspense标记，                                                                                                                                                         |
| RootSuspendedWithDelay | 4    | 对root对象进行suspense标记，                                                                                                                                                                         |
| RootCompleted          | 5    | 把root交给commitRoot函数                                                                                                                                                                             |
