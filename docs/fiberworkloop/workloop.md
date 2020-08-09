---
category: Fiber的工作循环机制
order: 2
title: WorkLoop
---

**WorkLoop**，中文名称：工作循环。它是Fiber的工作机制。分为：

1. workLoopSync 同步工作循环
2. workLoopConcurrent 并发工作循环

无论是那种工作循环，在底层代码中都会调用函数`performUnitOfWork`。

```js
// 这里的unitOfWork表示单个workInProgress fiber
function performUnitOfWork(unitOfWork) {
  // 一个fiber的current, flushed, state属性都存放在alternate属性中。一般情况下，
  // 这个属性不会在其他地方被调用。它的作用在于方便获取workInProgress fiber相关信息。
  const current = unitOfWork.alternate;
  // fibers是一个单向链表结构，当执行完成一个workInProgress fiber之后链表的指针就会指向下一个
  let next = beginWork(current, unitOfWork, subtreeRenderLanes);
  // 将挂起属性缓存起来
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  if (next === null) {
    // 整个链表上的所有fibers都执行完成，最后结束整个workInProgress fibers链表
    completeUnitOfWork(unitOfWork);
  } else {
    // 将当前workInProgress指向next
    workInProgress = next;
  }
  // 最后将ReactCurrentOwner清空。
  ReactCurrentOwner.current = null;
}
```