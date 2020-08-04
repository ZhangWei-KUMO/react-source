---
category: React中概念
order: 3
title: 泳道模型
---

在React 16.8之前的Fiber任务优先级模型使用的是**过期时间模型（ExpirationTime Modal）**，而如今使用的则是**泳道模型（Lane Modal）**， 它有以下两点优势：

1. 泳道（Lane）将任务优先级这个概念从任务批处理中解耦；
2. 泳道（Lane）可以使用单个32位数值来表示各种任务线程。

在以往的**过期时间模型（ExpirationTime Modal）**中，要决定是否在正在处理的批处理中包括给定的工作单元，我们会对比两个相关的优先级：

```js
// 确认当前task是否包含在batch之中，如果当前task的优先级高于batch优先级则为true
const isTaskIncludedInBatch = priorityOfTask >= priorityOfBatch;
```

假定有 A>B>C 三个task，在task A没有完成的情况下，B不可能工作，当然C更不可能。这种模型的设计在React引入**Suspense**概念之前便有。因为tasks只受CPU的限制在当时的版本中，这种设计是合理的。但是在引入**Suspense**概念之后，所有的task便有了I/O限制，这样就会出现一种情况：一个高优先级受I/O限制的task，被一个低优先级受CPU限制的task所阻塞渲染。

> 说人话就是一个被Suspense的高优先级渲染的组件很可能被不重要的任务所阻塞。

在之前的react的版本中，针对这一问题做了一个折中方案：

```js
const isTaskIncludedInBatch = taskPriority <= highestPriorityInRange && taskPriority >= lowestPriorityInRange;
```

但这种代码显然冗长难懂。在Lane新模型中，React解耦了这两个概念，tasks组不再使用number数值来表示，而是用位掩码（bitmasks）表示：

```js
// 进行简单的按位运算即可
const isTaskIncludedInBatch = (task & batchOfTasks) !== 0;
```

由位掩码所表示的task我们就称为`Lane`,位掩码表示的bacth称为`Lanes`。再另一方面，fiber不再关联一个update，而是多个。所以在fiber对象中多了`lanes`和`childLanes`字段。

## 新旧模型源码函数映射表

| ExpirationTime Modal      | Lane Modal           |
| :------------------------ | :------------------- |
| renderExpirationtime      | renderLanes          |
| update.expirationTime     | update.lane          |
| fiber.expirationTime      | fiber.lanes          |
| fiber.childExpirationTime | fiber.childLanes     |
| root.firstPendingTime     | root.lastPendingTime |
| root.firstPendingTime     | fiber.pendingLanes   |

[](https://github.com/facebook/react/pull/18796)