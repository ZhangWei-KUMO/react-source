---
category: React基础概念
order: 18
title: offscreen隐藏组件
---

```js
const updateLegacyHiddenComponent = updateOffscreenComponent;


function updateOffscreenComponent(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes,
) {
  const nextProps: OffscreenProps = workInProgress.pendingProps;
  const nextChildren = nextProps.children;

  const prevState: OffscreenState | null =
    current !== null ? current.memoizedState : null;

  if (
    nextProps.mode === 'hidden' ||
    nextProps.mode === 'unstable-defer-without-hiding'
  ) {
    if ((workInProgress.mode & ConcurrentMode) === NoMode) {
      // In legacy sync mode, don't defer the subtree. Render it now.
      // TODO: Figure out what we should do in Blocking mode.
      const nextState = {
        baseLanes: NoLanes,
      };
      workInProgress.memoizedState = nextState;
      pushRenderLanes(workInProgress, renderLanes);
    } else if (!includesSomeLane(renderLanes, OffscreenLane)) {
      let nextBaseLanes;
      if (prevState !== null) {
        const prevBaseLanes = prevState.baseLanes;
        nextBaseLanes = mergeLanes(prevBaseLanes, renderLanes);
      } else {
        nextBaseLanes = renderLanes;
      }

      workInProgress.lanes = workInProgress.childLanes = laneToLanes(
        OffscreenLane,
      );
      const nextState: OffscreenState = {
        baseLanes: nextBaseLanes,
      };
      workInProgress.memoizedState = nextState;
      // We're about to bail out, but we need to push this to the stack anyway
      // to avoid a push/pop misalignment.
      pushRenderLanes(workInProgress, nextBaseLanes);
      return null;
    } else {
      // Rendering at offscreen, so we can clear the base lanes.
      const nextState: OffscreenState = {
        baseLanes: NoLanes,
      };
      workInProgress.memoizedState = nextState;
      // Push the lanes that were skipped when we bailed out.
      const subtreeRenderLanes =
        prevState !== null ? prevState.baseLanes : renderLanes;
      pushRenderLanes(workInProgress, subtreeRenderLanes);
    }
  } else {
    let subtreeRenderLanes;
    if (prevState !== null) {
      subtreeRenderLanes = mergeLanes(prevState.baseLanes, renderLanes);
      // Since we're not hidden anymore, reset the state
      workInProgress.memoizedState = null;
    } else {
      // We weren't previously hidden, and we still aren't, so there's nothing
      // special to do. Need to push to the stack regardless, though, to avoid
      // a push/pop misalignment.
      subtreeRenderLanes = renderLanes;
    }
    pushRenderLanes(workInProgress, subtreeRenderLanes);
  }

  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  return workInProgress.child;
}
```