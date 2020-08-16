---
category: React基础概念
order: 17
title: Provider & Consumer
---

```js
function updateContextProvider(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes,
) {
  const providerType: ReactProviderType<any> = workInProgress.type;
  const context: ReactContext<any> = providerType._context;

  const newProps = workInProgress.pendingProps;
  const oldProps = workInProgress.memoizedProps;

  const newValue = newProps.value;

  pushProvider(workInProgress, newValue);

  if (oldProps !== null) {
    const oldValue = oldProps.value;
    const changedBits = calculateChangedBits(context, newValue, oldValue);
    if (changedBits === 0) {
      // No change. Bailout early if children are the same.
      if (
        oldProps.children === newProps.children &&
        !hasLegacyContextChanged()
      ) {
        return bailoutOnAlreadyFinishedWork(
          current,
          workInProgress,
          renderLanes,
        );
      }
    } else {
      // 一般情况下会到这一步，context值发生改变，搜索匹配的consumers并调度这些consumers更新
      propagateContextChange(workInProgress, context, changedBits, renderLanes);
    }
  }
  // 如果oldProps是null，表面上Provider是初次渲染
  const newChildren = newProps.children;
  // diff子节点即可
  reconcileChildren(current, workInProgress, newChildren, renderLanes);
  return workInProgress.child;
}
```

```js
function updateContextConsumer(
  current,
  workInProgress,
  renderLanes,
) {
  let context = workInProgress.type;
  const newProps = workInProgress.pendingProps;
  const render = newProps.children;
  prepareToReadContext(workInProgress, renderLanes);
  // unstable_observedBits 这是一个神秘的API
  const newValue = readContext(context, newProps.unstable_observedBits);
  let newChildren;
  newChildren = render(newValue);
  // diff子节点
  reconcileChildren(current, workInProgress, newChildren, renderLanes);
  return workInProgress.child;
}
```