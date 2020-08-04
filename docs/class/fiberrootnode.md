---
category: React源码中的类
order: 1
title: FiberRootNode
---

**FiberRootNode**是React核心类之一，它由`createFiberRoot`构造函数创建出一个fiber实例。代码位于`ReactFiberRoot.js`中.

## 什么是FiberRootNode

1. 它是整个应用的起点
2. 包含挂载的目标节点
3. 记录整个应用更新过程的所有信息


```js
function FiberRootNode(containerInfo, tag, hydrate) {
  this.tag = tag;
  // 就是我们挂载的DOM节点
  this.containerInfo = containerInfo;
  // react-dom中不涉及，持久化更新使用。
  this.pendingChildren = null;
  // Root Fiber/uninitializedFiber, 每一个React应用都会有一个对应的根Fiber
  this.current = null;
  this.pingCache = null;
  // 在某个更新中，已经完成的任务。当完成更新后，就会将数据渲染到DOM节点上。
  // 而这个过程的本质就是读取finishedWork数据。
  this.finishedWork = null;
  // 
  this.timeoutHandle = noTimeout;
  // 只有在调用renderSubtreeInfoContainer API才会使用到，可以忽略
  this.context = null;
  this.pendingContext = null;
  // 是否需要和之前的DOM节点进行合并
  this.hydrate = hydrate;
  this.callbackNode = null;
  this.callbackPriority = NoLanePriority;
  this.eventTimes = createLaneMap(NoLanes);
  this.expirationTimes = createLaneMap(NoTimestamp);

  this.pendingLanes = NoLanes;
  this.suspendedLanes = NoLanes;
  this.pingedLanes = NoLanes;
  this.expiredLanes = NoLanes;
  this.mutableReadLanes = NoLanes;
  this.finishedLanes = NoLanes;

  this.entangledLanes = NoLanes;
  this.entanglements = createLaneMap(NoLanes);

  if (supportsHydration) {
    this.mutableSourceEagerHydrationData = null;
  }

  if (enableSchedulerTracing) {
    this.interactionThreadID = unstable_getThreadID();
    this.memoizedInteractions = new Set();
    this.pendingInteractionMap = new Map();
  }
  if (enableSuspenseCallback) {
    this.hydrationCallbacks = null;
  }
}

export function createFiberRoot(containerInfo,tag,hydrate,hydrationCallbacks) {
  const root = new FiberRootNode(containerInfo, tag, hydrate);
  if (enableSuspenseCallback) {
    root.hydrationCallbacks = hydrationCallbacks;
  }
  const uninitializedFiber = createHostRootFiber(tag);
  root.current = uninitializedFiber;
  uninitializedFiber.stateNode = root;
  initializeUpdateQueue(uninitializedFiber);
  return root;
}
```