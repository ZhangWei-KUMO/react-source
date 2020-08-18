---
category: React更新
order: 9
title: 更新队列
---


**UpdateQueues**是React优先更新的一个链表。类似于**fibers**,**UpdateQueues**存在两个queue，一个`current queue`表示当前显示器上的queue，一个是`work-in-progress queue`, 在提交renderer之前用于计算和异步处理的queue。这也是一个典型的**double buffering**模型格式。假设`work-in-progress queue`在最终渲染之前由于某种原因被中断，React会基于`current queue`复制出一个新的`work-in-progress queue`。

这两个queues都共享同一个持久化的单向链表结构。当我们在调度一个`update`的时候，React会将这个`update`放入这两个queue的最后面。每一个queue有会有一个指针指向链表中尚未执行的`update`中的第一个`update`。`work-in-progress queue`指针所在的位置永远大于等于`current queue`指针位置。之所以说是大于等于，`current queue`指针滞后的原因在于，只有`work-in-progress queue`运行到**commit阶段**，相对的`current queue`指针才发生更新。

假设这里有一个`current queue`：

```js
["A","B","C","D","E","F"]
```

一个`work-in-progress queue`, **D,E,F** 是我们新提交的updates：

```js
["D","E","F"]
```

假设此时CPU和内存中正在运算的`work-in-progress queue`指针指向**D**，正常情况下屏幕显示和`current queue`指针的位置会在**C**上，只有当**D**完成提交，`current queue`指针才会指向**D**。


### 为什么需要向两个同时queue放入updates任务？

React的开发人员要了解`work-in-progress`挂掉是很正常的事情。如果此时我们只将updates任务放入`work-in-progress queue`那么会发生什么幺蛾子事情呢？

#### 在diff阶段挂了

我们还是用上面的案例，React的重启机制会在中断后基于`current queue`再次生成一个新的`work-in-progress queue`，`work-in-progress queue`就成了`["A","B","C"]`，React的diff算法一看`current queue === work-in-progress` 所以就不会继续执行更新任务，我们称为**更新丢失**。

#### commit阶段挂了

如果`work-in-progress`在commit阶段挂了，`current queue`就快要将指针指向`["D","E","F"]`了，但是对不起，还是基于之前的queue再次生成一个新的`work-in-progress queue`，重新进行一次更新计算，这个我们称为**二次更新** 。


也就是说无论当前的`work-in-progress queue`会不会执行成功，无论在什么阶段挂掉，React都必须确保更新不中断，这个`work-in-progress queue`挂了，那它就基于updates生成下一个`work-in-progress queue`。同时也要保证当`work-in-progress queue`一旦commit，它的身份立马变成`current queue`，不存在同一更新执行两次的情况发生。


## 优先级

单就**updatequeue**自身而言不存在优先级这个概念，新提交上来的update永远都是在链表的最后。

但是优先级显然在更新中仍然十分重要。 当在render阶段执行updatequeue时，最终输出的结果只有满足优先级的update任务。某些更新任务由于没有满足特定优先级条件而被跳过的话，它仍会留在queue中，等待稍后执行render。

高优先级的update任务可能会在不同的优先级中被执行两次，React会追踪**base state**。

> Base State表示在首次更新中已经被应用到的state，这个state尽管基于Result state，但是并不等同于Result state。

假设我们有一个updatequeue,初始化的状态是'', 1和2代表优先级,React将这些更新作为两个单独的渲染处理，每个渲染级别不同：

```js
  [A1,B2,C1,D2]
```

   首次render:

     * Base state: ''
     * Updates: [A1, C1]
     * Result state: 'AC'

   第二次render:
     * Base state: 'A'            <-  我们会好奇为什么Base State没有包含C,
                                      这是由于在首次render的时候，B2被跳过basestate追踪就停止了
     * Updates: [B2, C1, D2]      
     * Result state: 'ABCD'      <- 最终render所有的更新任务。

