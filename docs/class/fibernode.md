---
category: React源码中的类
order: 2
title: FiberNode
---

**FiberNode**是React核心类之一，它由`createFiber`构造函数创建出一个fiber实例。代码位于`ReactFiber.js`中.

## 什么是Fiber

**Fiber是React16之后的核心概念，每一个ReactElement都会对应一个Fiber对象，它会记录一个节点的各种状态**。对于我们在开发中经常使用的`state`和`props`，它们实际上是记录在Fiber对象上。每一次更新，都是先更新Fiber对象，再更新Component组件。

 > 在**Class Component**中存在`this`关键字，当我们在调用`this.setState()`方法时，我们会误以为state的更新是在Component内部进行，实际并非如此。正是React基于Fiber对象的更新，所以尽管**functional Component**组件没有`this`关键字，但是我们依然可以通过Fiber对象，通过`hooks`实现状态更新。

<img src="https://test-1253763202.cos.ap-shanghai.myqcloud.com/docs/react-source/dom_tree.png" style="width:100%" alt="树架构"/>

上面是一张React Element Tree的结构图，那么我们看下它所对应的Fiber Tree结构图是怎样的：

<img src="https://test-1253763202.cos.ap-shanghai.myqcloud.com/docs/react-source/fiberschedule.png" style="width:100%" alt="Fiber架构"/>

```js
function FiberNode(
  tag: WorkTag,
  pendingProps: mixed,
  key: null | string,
  mode: TypeOfMode,
) {
  // Instance
  this.tag = tag;
  this.key = key;
  this.elementType = null;
  this.type = null;
  this.stateNode = null;

  // 对应一个Fiber它有以下四个属性，它帮助React将整个应用中的所有节点进行一一串联
  this.return = null;
  this.child = null;
  this.sibling = null;
  this.index = 0;

  this.ref = null;

  this.pendingProps = pendingProps;
  this.memoizedProps = null;
  this.updateQueue = null;
  this.memoizedState = null;
  this.dependencies = null;

  this.mode = mode;

  // Effects
  this.effectTag = NoEffect;
  this.subtreeTag = NoSubtreeEffect;
  this.deletions = null;
  this.nextEffect = null;

  this.firstEffect = null;
  this.lastEffect = null;

  this.lanes = NoLanes;
  this.childLanes = NoLanes;

  this.alternate = null;

  if (enableProfilerTimer) {
    // Note: The following is done to avoid a v8 performance cliff.
    //
    // Initializing the fields below to smis and later updating them with
    // double values will cause Fibers to end up having separate shapes.
    // This behavior/bug has something to do with Object.preventExtension().
    // Fortunately this only impacts DEV builds.
    // Unfortunately it makes React unusably slow for some applications.
    // To work around this, initialize the fields below with doubles.
    //
    // Learn more about this here:
    // https://github.com/facebook/react/issues/14365
    // https://bugs.chromium.org/p/v8/issues/detail?id=8538
    this.actualDuration = Number.NaN;
    this.actualStartTime = Number.NaN;
    this.selfBaseDuration = Number.NaN;
    this.treeBaseDuration = Number.NaN;

    // It's okay to replace the initial doubles with smis after initialization.
    // This won't trigger the performance cliff mentioned above,
    // and it simplifies other profiler code (including DevTools).
    this.actualDuration = 0;
    this.actualStartTime = -1;
    this.selfBaseDuration = 0;
    this.treeBaseDuration = 0;
  }
}

// This is a constructor function, rather than a POJO constructor, still
// please ensure we do the following:
// 1) Nobody should add any instance methods on this. Instance methods can be
//    more difficult to predict when they get optimized and they are almost
//    never inlined properly in static compilers.
// 2) Nobody should rely on `instanceof Fiber` for type testing. We should
//    always know when it is a fiber.
// 3) We might want to experiment with using numeric keys since they are easier
//    to optimize in a non-JIT environment.
// 4) We can easily go from a constructor to a createFiber object literal if that
//    is faster.
// 5) It should be easy to port this to a C struct and keep a C implementation
//    compatible.
const createFiber = function(tag,pendingProps,key,mode) {
  return new FiberNode(tag, pendingProps, key, mode);
};
```