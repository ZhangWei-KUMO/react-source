---
category: React基础概念
order: 11
title: WorkInProgress | 工作树
---

`WorkInProgress`是React双缓冲机制中的运行fiber树，由current fiber的`alternate`属性所指向。

```js
// 传入current Fiber 和挂起的Props
export function createWorkInProgress(current, pendingProps) {
  // 第一步从current fiber树的备胎属性中获取值；
  let workInProgress = current.alternate;
  // 首次渲染必然为空
  if (workInProgress === null) {
    // 初始化一个普通fiber对象
    workInProgress = createFiber(
      current.tag,
      pendingProps,
      current.key,
      current.mode,
    );
    // 
    workInProgress.elementType = current.elementType;
    workInProgress.type = current.type;
    // 赋值挂载的dom
    workInProgress.stateNode = current.stateNode;
    // 将备胎属性反向指回current fiber
    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    // 真正有价值的代码在这里，此时pendingProps会是一个新的props
    workInProgress.pendingProps = pendingProps;
    // Needed because Blocks store data on type.
    workInProgress.type = current.type;

    // We already have an alternate.
    workInProgress.subtreeTag = NoSubtreeEffect;
    workInProgress.deletions = null;
  }

  // 以下都只是workInProgress对current fiber的复制而已。
  workInProgress.effectTag = current.effectTag & StaticMask;
  workInProgress.childLanes = current.childLanes;
  workInProgress.lanes = current.lanes;

  workInProgress.child = current.child;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.updateQueue = current.updateQueue;

  const currentDependencies = current.dependencies;
  workInProgress.dependencies =
    currentDependencies === null
      ? null
      : {
          lanes: currentDependencies.lanes,
          firstContext: currentDependencies.firstContext,
          responders: currentDependencies.responders,
        };

  // 兄弟节点保持一致
  workInProgress.sibling = current.sibling;
  // 索引值保持一致
  workInProgress.index = current.index;
  // ref所指ref保持一致
  workInProgress.ref = current.ref;
  return workInProgress;
}
```