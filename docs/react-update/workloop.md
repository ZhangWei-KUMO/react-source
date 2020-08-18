---
category: React更新
order: 10
title: WorkLoop
---

**WorkLoop**，中文名称：工作循环。它是Fiber的工作机制。分为：

1. workLoopSync 同步工作循环
2. workLoopConcurrent 并发工作循环

不管是哪种它的内部都是调用两个核心函数`beginWork`和`completeUnitOfWork`

## completeUnitOfWork

```js
function completeUnitOfWork(unitOfWork) {=
  // 从宏观角度就是要完成当前FiberNode的计算工作，将指针移到兄弟节点上（sibing），如果
  // 当前节点不存在兄弟节点，则返回到父级fiberNode上
  let completedWork = unitOfWork;
  do {
    // The current, flushed, state of this fiber is the alternate. Ideally
    // nothing should rely on this, but relying on it here means that we don't
    // need an additional field on the work in progress.
    const current = completedWork.alternate;
    const returnFiber = completedWork.return;

    // 检查计算工作是否完成，或者是否有某些报错
    if ((completedWork.effectTag & Incomplete) === NoEffect) {
      let next;
      next = completeWork(current, completedWork, subtreeRenderLanes);
      // 正常情况next应该为null，
      if (next !== null) {
        workInProgress = next;
         // 如果没玩则给workInProgress赋值，继续运算
        return;
      }

      resetChildLanes(completedWork);
      if (
        returnFiber !== null &&
        // Do not append effects to parents if a sibling failed to complete
        (returnFiber.effectTag & Incomplete) === NoEffect
      ) {
        // Append all the effects of the subtree and this fiber onto the effect
        // list of the parent. The completion order of the children affects the
        // side-effect order.
        if (returnFiber.firstEffect === null) {
          returnFiber.firstEffect = completedWork.firstEffect;
        }
        if (completedWork.lastEffect !== null) {
          if (returnFiber.lastEffect !== null) {
            returnFiber.lastEffect.nextEffect = completedWork.firstEffect;
          }
          returnFiber.lastEffect = completedWork.lastEffect;
        }

        // If this fiber had side-effects, we append it AFTER the children's
        // side-effects. We can perform certain side-effects earlier if needed,
        // by doing multiple passes over the effect list. We don't want to
        // schedule our own side-effect on our own list because if end up
        // reusing children we'll schedule this effect onto itself since we're
        // at the end.
        const effectTag = completedWork.effectTag;

        // Skip both NoWork and PerformedWork tags when creating the effect
        // list. PerformedWork effect is read by React DevTools but shouldn't be
        // committed.
        if (effectTag > PerformedWork) {
          if (returnFiber.lastEffect !== null) {
            returnFiber.lastEffect.nextEffect = completedWork;
          } else {
            returnFiber.firstEffect = completedWork;
          }
          returnFiber.lastEffect = completedWork;
        }
      }
    } else {
      // This fiber did not complete because something threw. Pop values off
      // the stack without entering the complete phase. If this is a boundary,
      // capture values if possible.
      const next = unwindWork(completedWork, subtreeRenderLanes);

      // Because this fiber did not complete, don't reset its expiration time.

      if (next !== null) {
        // If completing this work spawned new work, do that next. We'll come
        // back here again.
        // Since we're restarting, remove anything that is not a host effect
        // from the effect tag.
        next.effectTag &= HostEffectMask;
        workInProgress = next;
        return;
      }

      if (returnFiber !== null) {
        // Mark the parent fiber as incomplete and clear its effect list.
        returnFiber.firstEffect = returnFiber.lastEffect = null;
        returnFiber.effectTag |= Incomplete;
        returnFiber.subtreeTag = NoSubtreeTag;
        returnFiber.deletions = null;
      }
    }
    // 正常情况下会到这里，也就是兄弟节点的计算
    const siblingFiber = completedWork.sibling;

    if (siblingFiber !== null) {
      // 一般有兄弟节点就直接将下一个workInProgress指向这个兄弟节点，接着workLoop
      workInProgress = siblingFiber;
      return;
    }
    // 如果不存在兄弟节点，
    completedWork = returnFiber;
    // Update the next thing we're working on in case something throws.
    workInProgress = completedWork;
  } while (completedWork !== null);

  // We've reached the root.
  if (workInProgressRootExitStatus === RootIncomplete) {
    workInProgressRootExitStatus = RootCompleted;
  }
}
```