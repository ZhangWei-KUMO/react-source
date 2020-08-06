---
category: React更新
order: 2
title: lane泳道与fiber任务链表的的更新
---

`update`是记录状态改变的对象,存放于单向链表`UpdateQueue`中。如果在同一个事件中多次调用`setState`方法，就会同时出现多个`update`, 它们会在多个setState创建完成之后，放入`UpdateQueue`中最后一起更新。

我们知道当业务代码在执行`ReactDOM.render`方法时， 在React源码中会调用`updateContainer`函数。这个函数位于`react-reconciler/src/ReactFiberReconciler`文件中。

```js
export function updateContainer(element,container,parentComponent,callback) {
  // 获取当前更新的fiber对象
  const current = container.current;
  //获取eventTime（程序运行到此刻的时间戳），React会基于它进行更新优先级排序
  const eventTime = requestEventTime();
  // 当前suspense的配置
  const suspenseConfig = requestCurrentSuspenseConfig();
  // React16.8中引入的泳道概念，替代了ExpirationTime标注更新task的优先级
  const lane = requestUpdateLane(current, suspenseConfig);

  if (enableSchedulingProfiler) {
    markRenderScheduled(lane);
  }
  // 获取当前树结构的上下文
  const context = getContextForSubtree(parentComponent);
  if (container.context === null) {
    // 如果是首次渲染，就直接挂载
    container.context = context;
  } else {
    // 如果是更新渲染，则将最新的上下文挂载到pendingContext属性上，等待更新
    container.pendingContext = context;
  }
  // 将上面的计算出来的值合并成一个update对象
  const update = createUpdate(eventTime, lane, suspenseConfig);
  // 将元素挂载到payload上
  update.payload = { element };
  // 如果开发者定义了回调函数，则挂载callback字段
  callback = callback === undefined ? null : callback;
  if (callback !== null) {
    update.callback = callback;
  }
  // 从名称上看是队列更新，实际上是对fiber中的链表进行更新，将update task对象挂载到pending属性上
  enqueueUpdate(current, update);
  // 关于这个函数 请参加「Fiber里的调度更新」
  scheduleUpdateOnFiber(current, lane, eventTime);
  // 经过一系列更新之后，我们将刚开始创建的lane返回
  return lane;
}
```
## createUpdate

`createUpdate`是泳道概念引入React后的新函数，它基于当前时间戳、最新的lane以及suspense配置对象封装出一个新的`update`对象。它的代码非常简单

```js
// ReactUpdateQueue.js
export function createUpdate(eventTime,lane,suspenseConfig){
  const update = {
    eventTime,
    lane,
    suspenseConfig,
    tag: UpdateState,// 常量为0
    payload: null,
    callback: null,
    next: null,
  };
  return update;
}
```

## requestUpdateLane

泳道的优先级计算基于`fiber.mode`属性值分为以下几类：

1. SyncLane同步泳道 也就是普通泳道
2. 在并发模式下的同步泳道
3. 在并发模型下的批量泳道


```js
export function requestUpdateLane(fiber, suspenseConfig) {
  // Special cases
  const mode = fiber.mode;
  if ((mode & BlockingMode) === NoMode) {
    return (SyncLane);
  } else if ((mode & ConcurrentMode) === NoMode) {
    return getCurrentPriorityLevel() === ImmediateSchedulerPriority
      ? (SyncLane)
      : (SyncBatchedLane);
  } else if (
    !deferRenderPhaseUpdateToNextBatch &&
    (executionContext & RenderContext) !== NoContext &&
    workInProgressRootRenderLanes !== NoLanes
  ) {
    // This is a render phase update. These are not officially supported. The
    // old behavior is to give this the same "thread" (expiration time) as
    // whatever is currently rendering. So if you call `setState` on a component
    // that happens later in the same render, it will flush. Ideally, we want to
    // remove the special case and treat them as if they came from an
    // interleaved event. Regardless, this pattern is not officially supported.
    // This behavior is only a fallback. The flag only exists until we can roll
    // out the setState warning, since existing code might accidentally rely on
    // the current behavior.
    return pickArbitraryLane(workInProgressRootRenderLanes);
  }
```

## enqueueUpdate

`enqueueUpdate` 是针对fiber链表的一个更新方法，将update task对象挂载到pending属性上

```js
// ReactUpdateQueue.js
export function enqueueUpdate(fiber, update) {
  const updateQueue = fiber.updateQueue;
  // 这种情况只有在fiber被卸载（unmounted）的情况下才会出现
  if (updateQueue === null) {
    return;
  }
  const sharedQueue = updateQueue.shared;
  const pending = sharedQueue.pending;
  // 检查当前链表
  if (pending === null) {
    // This is the first update. Create a circular list.
    update.next = update;
  } else {
    update.next = pending.next;
    pending.next = update;
  }
  // 将对象挂载到pending属性上
  sharedQueue.pending = update;
}
```