---
category: 其他
order: 3
title: React 懒加载的源码实现(未完成)
---

## 懒加载组件的安装
```js
function mountLazyComponent(
  _current,
  workInProgress,
  elementType,
  updateLanes,
  renderLanes,
) {
  if (_current !== null) {
    // A lazy component only mounts if it suspended inside a non-
    // concurrent tree, in an inconsistent state. We want to treat it like
    // a new mount, even though an empty version of it already committed.
    // Disconnect the alternate pointers.
    _current.alternate = null;
    workInProgress.alternate = null;
    // Since this is conceptually a new fiber, schedule a Placement effect
    workInProgress.effectTag |= Placement;
  }

  const props = workInProgress.pendingProps;
  const lazyComponent = elementType;
  const payload = lazyComponent._payload;
  const init = lazyComponent._init;
  let Component = init(payload);
  workInProgress.type = Component;
  // 获取当前组件的标签类型，给workInProgress赋上tag值；
  const resolvedTag = (workInProgress.tag = resolveLazyComponentTag(Component));
  const resolvedProps = resolveDefaultProps(Component, props);
  let child;
  switch (resolvedTag) {
    case FunctionComponent: {
      child = updateFunctionComponent(
        null,
        workInProgress,
        Component,
        resolvedProps,
        renderLanes,
      );
      return child;
    }
    case ClassComponent: {
      child = updateClassComponent(
        null,
        workInProgress,
        Component,
        resolvedProps,
        renderLanes,
      );
      return child;
    }
    case ForwardRef: {
      child = updateForwardRef(
        null,
        workInProgress,
        Component,
        resolvedProps,
        renderLanes,
      );
      return child;
    }
    case MemoComponent: {
      child = updateMemoComponent(
        null,
        workInProgress,
        Component,
        resolveDefaultProps(Component.type, resolvedProps), // The inner type can have defaults too
        updateLanes,
        renderLanes,
      );
      return child;
    }
    case Block: {
      if (enableBlocksAPI) {
        // TODO: Resolve for Hot Reloading.
        child = updateBlock(
          null,
          workInProgress,
          Component,
          props,
          renderLanes,
        );
        return child;
      }
      break;
    }
  }
  let hint = '';
}
```