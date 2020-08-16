---
category: Fiber的工作循环机制
order: 0
title: 同步渲染机制
---

```js
// 代码截取于ReactFiberWorkLoop.js
function performSyncWorkOnRoot(root) {
  flushPassiveEffects();
  let lanes;
  if (root === workInProgressRoot && includesSomeLane(root.expiredLanesworkInProgressRootRenderLanes)) {
    // There's a partial tree, and at least one of its lanes has expired. Finish
    // rendering it before rendering the rest of the expired work.
    lanes = workInProgressRootRenderLanes;
    renderRootSync(root, lanes);
    if (
      includesSomeLane(
        //当前传入的lanes
        workInProgressRootIncludedLanes,
        // 已经更新的lanes
        workInProgressRootUpdatedLanes,
      )
    ) {
      // The render included lanes that were updated during the render phase.
      // For example, when unhiding a hidden tree, we include all the lanes
      // that were previously skipped when the tree was hidden. That set of
      // lanes is a superset of the lanes we started rendering with.
      //
      // Note that this only happens when part of the tree is rendered
      // concurrently. If the whole tree is rendered synchronously, then there
      // are no interleaved events.
      lanes = getNextLanes(root, lanes);
      renderRootSync(root, lanes);
    }
  } else {
    lanes = getNextLanes(root, NoLanes);
    renderRootSync(root, lanes);
  }
  
  // current fiber树上的备胎指针拿到finishedWork
  const finishedWork = root.current.alternate;
  // 将finishedWork和finishedLanes两属性赋值后，提交
  root.finishedWork = finishedWork;
  root.finishedLanes = lanes;
  // 从逻辑代码到这一步就结束了
  commitRoot(root);

  // Before exiting, make sure there's a callback scheduled for the next
  // pending level.
  ensureRootIsScheduled(root, now());

  return null;
}
```