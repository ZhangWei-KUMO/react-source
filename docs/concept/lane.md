---
category: React基础概念
order: 3
title: Lane | 泳道模型
---


## 泳道

ReactFiber根据渲染顺序将泳道优先级从0~17分为十八个等级：

| 名称                         | 解释                   | 优先级 | 32位位掩码                        |
| :--------------------------- | :--------------------- | :----- | :-------------------------------- |
| SyncLane                     | 同步泳道优先级         | 17     | 0b0000000000000000000000000000001 |
| SyncBatchedLane              | 同步批量泳道优先级     | 16     | 0b0000000000000000000000000000010 |
| InputDiscreteHydrationLane   | 输入离散脱水泳道优先级 | 15     | 0b0000000000000000000000000000100 |
| InputDiscreteLane            | 输入离散泳道优先级     | 14     | 0b0000000000000000000000000011000 |
| InputContinuousHydrationLane | 输入连续脱水泳道优先级 | 13     | 0b0000000000000000000000000100000 |
| InputContinuousLane          | 输入连续泳道优先级     | 12     | 0b0000000000000000000000011000000 |
| DefaultHydrationLane         | 默认脱水泳道优先级     | 11     | 0b0000000000000000000000100000000 |
| DefaultLane                  | 默认泳道优先级         | 10     | 0b0000000000000000000111000000000 |
| TransitionShortHydrationLane | 过渡短期脱水泳道优先级 | 9      | 0b0000000000000000001000000000000 |
| TransitionShortLane          | 过渡短期泳道优先级     | 8      | 0b0000000000000011110000000000000 |
| TransitionLongHydrationLane  | 过渡长期脱水泳道优先级 | 7      | 0b0000000000000100000000000000000 |
| TransitionLongLane           | 过渡长期泳道优先级     | 6      | 0b0000000001111000000000000000000 |
| RetryLane                    | 重试泳道优先级         | 5      | 0b0000011110000000000000000000000 |
| SelectiveHydrationLane       | 选择性脱水泳道优先级   | 4      | 0b0000100000000000000000000000000 |
| IdleHydrationLane            | 空闲脱水泳道优先级     | 3      | 0b0001000000000000000000000000000 |
| IdleLane                     | 空闲泳道优先级         | 2      | 0b0110000000000000000000000000000 |
| OffscreenLane                | 离屏泳道优先级         | 1      | 0b1000000000000000000000000000000 |
| NoLane                       | 没有泳道               | 0      | 0b0000000000000000000000000000000 |
| NoLanes                      | 没有泳道（集群）       | 0      | 0b0000000000000000000000000000000 |
| NonIdleLanes                 | 无空闲泳道             | /      | 0b0000111111111111111111111111111 |

如果单看上面的泳道表对于很多人来说可能会蒙圈，但是其实上面的表格恰恰能够帮助学习者理解什么是泳道（Lane）。首先React的源码学习者要了解到尽管Lane的优先级有18个之多，但是对于Fiber的调度机制的优先级来说仅仅只有6个，当ReactFiber在运行时会获取`LanePriority`，通过`lanePriorityToSchedulerPriority`方法最终获取到Fiberd调度优先级（`schedulerPriorityLevel`）。而Fiber的调度优先级由低到高分别是：

1. NoPriority  0
2. ImmediatePriority 1;
3. UserBlockingPriority 2;
4. NormalPriority 3;
5. LowPriority 4;
6. IdlePriority 5;

在源码中情况如下：

```js
 function lanePriorityToSchedulerPriority(lanePriority) {
  switch (lanePriority) {
    case SyncLanePriority:
    case SyncBatchedLanePriority:
      // 这里可以看到同步泳道优先级和同步批量泳道优先级对应的是Fiber调度的立即执行优先级
      return ImmediatePriority;
    ...
  }
```

同样ReactFiber也提供了从调度优先级映射泳道优先级的函数`schedulerPriorityToLanePriority`:

```js
export function schedulerPriorityToLanePriority(schedulerPriorityLevel) {
  switch (schedulerPriorityLevel) {
    case ImmediatePriority:
      return SyncLanePriority;
    case UserBlockingPriority:
      return InputContinuousLanePriority;
    case NormalPriority:
    case LowPriority:
      return DefaultLanePriority;
    case IdlePriority:
      return IdleLanePriority;
    default:
      return NoLanePriority;
  }
}
```

在这里我们会发现映射回来的泳道优先级就少很多，也可以发现尽管源码中提供18种泳道优先级，但是核心泳道优先级只有上面五种。











## 新旧模型源码函数映射表

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


| ExpirationTime Modal      | Lane Modal           |
| :------------------------ | :------------------- |
| renderExpirationtime      | renderLanes          |
| update.expirationTime     | update.lane          |
| fiber.expirationTime      | fiber.lanes          |
| fiber.childExpirationTime | fiber.childLanes     |
| root.firstPendingTime     | root.lastPendingTime |
| root.firstPendingTime     | fiber.pendingLanes   |

[](https://github.com/facebook/react/pull/18796)