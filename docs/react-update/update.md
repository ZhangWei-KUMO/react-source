---
category: React更新
order: 2
title: Update 与 UpdateQueue
---

`update`是记录状态改变的对象,存放于单向链表`UpdateQueue`中。如果在同一个事件中多次调用`setState`方法，就会同时出现多个`update`, 它们会在多个setState创建完成之后，放入`UpdateQueue`中最后一起更新。

我们知道当业务代码在执行`ReactDOM.render`方法时， 在React源码中会调用`updateContainer`函数。这个函数位于`react-reconciler/src/ReactFiberReconciler`文件中。

```js
export function updateContainer(
  element: ReactNodeList,
  container: OpaqueRoot,
  parentComponent: ?React$Component<any, any>,
  callback: ?Function,
): Lane {

  const current = container.current;
  //获取eventTime（程序运行到此刻的时间戳），React会基于它进行更新优先级排序
  const eventTime = requestEventTime();
  // 当前suspense的配置
  const suspenseConfig = requestCurrentSuspenseConfig();
  // 
  const lane = requestUpdateLane(current, suspenseConfig);

  if (enableSchedulingProfiler) {
    markRenderScheduled(lane);
  }
  
  const context = getContextForSubtree(parentComponent);
  if (container.context === null) {
    container.context = context;
  } else {
    container.pendingContext = context;
  }

  const update = createUpdate(eventTime, lane, suspenseConfig);
  update.payload = { element };
  callback = callback === undefined ? null : callback;
  if (callback !== null) {
    update.callback = callback;
  }

  enqueueUpdate(current, update);
  scheduleUpdateOnFiber(current, lane, eventTime);

  return lane;
}
```
## createUpdate

## requestUpdateLane

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