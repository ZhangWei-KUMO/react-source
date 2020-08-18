---
category: React更新
order: 7
title: ReactFiber中的Slot
---

如果接触过其他前端框架，如Vue，angular大家对于 **“槽（Slot）”** 这个概念并不陌生，对于React来说在应用代码层面是不存在Slot这个概念的，但是不代表其底层源码中不存在。当fiber的diff算法在计算子fiberNode的时候，会通过`updateSlot`方法生成一个新的fiberNode`newFiber`.

在fiber的运行逻辑中，当它发现自己的子节点是一个数组的时候，它首先会去遍历这个数组，根据数组的索引值，调用`updateSlot`生成一个个`newFiber`。

```js
// 传入了四个参数，主要是基于oldFiber, newChild新旧两个fiber进行判断
  function updateSlot(returnFiber, oldFiber, newChild, lanes) {
    // 在更新fiber之前首先尝试获取oldFiber的key值
    const key = oldFiber !== null ? oldFiber.key : null;
    // 首先判断newChild是否为文本节点
    if (typeof newChild === "string" || typeof newChild === "number") {
      if (key !== null) {
        // 文本节点大家知道是不应存在key属性
        return null;
      }
      return updateTextNode(returnFiber, oldFiber, `${newChild}`, lanes);
    }
    // 如果newChild是对象的话，我们就需要判断它的$$typeof
    if (typeof newChild === "object" && newChild !== null) {
      switch (newChild.$$typeof) {
        // 大部分情况都是React元素
        case REACT_ELEMENT_TYPE: {
          // 根据key值进行同级更新
          if (newChild.key === key) {
            // 这里有个特殊情况，就是React fragment类型，
            if (newChild.type === REACT_FRAGMENT_TYPE) {
              // 遇到这种情况交给updateFragment
              return updateFragment(
                returnFiber,
                oldFiber,
                newChild.props.children,
                lanes,
                key
              );
            }
            return updateElement(returnFiber, oldFiber, newChild, lanes);
          }
          return null;
        }
        // portal类型不予讨论
        case REACT_PORTAL_TYPE: {
          if (newChild.key === key) {
            return updatePortal(returnFiber, oldFiber, newChild, lanes);
          }
          return null;
        }
        // lazy类型不予讨论
        case REACT_LAZY_TYPE: {
          if (enableLazyElements) {
            const payload = newChild._payload;
            const init = newChild._init;
            return updateSlot(returnFiber, oldFiber, init(payload), lanes);
          }
        }
      }
      // 如果是数组或者迭代函数的话
      if (isArray(newChild) || getIteratorFn(newChild)) {
        if (key !== null) {
          return null;
        }
        // 交给updateFragment
        return updateFragment(returnFiber, oldFiber, newChild, lanes, null);
      }
      throwOnInvalidObjectType(returnFiber, newChild);
    }
    return null;
  }
```

通过上面的代码我可以得知，如果子fiberNode是数组、迭代函数、fragment类型都是会去执行`updateFragment`函数，如果是普通的react元素则执行`updateElement`,文本节点则执行`updateTextNode`。

## updateTextNode

我们先说`updateTextNode`,为什么说它，因为它代码最简单，我们可以通过它了解fiber更新的逻辑：

```js
// 这里的current等同于oldFiber,textContex等同于newFiber
  function updateTextNode(returnFiber, current, textContent, lanes) {
    // 如果oldFiber是null或者不是tag不是HostText
    // 这种情况是存在的比如之前的fiber的父级就是一个空标签
    if (current === null || current.tag !== HostText) {
      // 这个时候，我们会基于当前文本创建一个新的fiber对象
      const created = createFiberFromText(textContent, returnFiber.mode, lanes);
      // 将returnFiber挂载到return属性中
      created.return = returnFiber;
      // 将创建出来的fiber返回，当前fiberNode获得更新
      return created;
    }
    // 大部分情况，我们还是基于新旧fiber创建出一个新的fiber
    const existing = useFiber(current, textContent);
    existing.return = returnFiber;
    // fiber返回，当前fiberNode获得更新
    return existing;
  }
   function useFiber(fiber, pendingProps) {
    // 注意这里的常量名为clone，为什么不是created？
    const clone = createWorkInProgress(fiber, pendingProps);
    // 因为文本节点具有唯一性，所以index为0，sibing为null
    clone.index = 0;
    clone.sibling = null;
    return clone;
  }
```

在上面的代码解析中，我们提到为什么`createWorkInProgress`函数出来的常量叫clone而不是created？我们现在就开看这段代码(会删去与`useFiber`无关的代码)：

```js
export function createWorkInProgress(current, pendingProps) {
  // 第一步从current对象，也就是oldFiberNode中拿取备胎属性alternate为workInProgress，
  // 之后所有的计算都是基于workInProgress这个fiberNode
  let workInProgress = current.alternate;
   // 真正有价值的代码在这里，此时pendingProps会是一个新的props
    workInProgress.pendingProps = pendingProps;
    // 对于effectList初始化给予空值
  workInProgress.subtreeTag = NoSubtreeEffect;
  workInProgress.deletions = null;
  // 剩下的属性都是对current fiber的复制而已。
   workInProgress.type = current.type;
  workInProgress.effectTag = current.effectTag & StaticMask;
  workInProgress.childLanes = current.childLanes;
  workInProgress.lanes = current.lanes;
  workInProgress.sibling = current.sibling;
  workInProgress.index = current.index;
  workInProgress.ref = current.ref;
  workInProgress.child = current.child;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.updateQueue = current.updateQueue;

  const currentDependencies = current.dependencies;
  workInProgress.dependencies = currentDependencies === null? null
      : {
          lanes: currentDependencies.lanes,
          firstContext: currentDependencies.firstContext,
          responders: currentDependencies.responders,
        };
  return workInProgress;
}
```

通过上面的代码我们可以看出，所谓`createWorkInProgress`在更新渲染阶段并不是真的创建出一个WorkInProgress fiberNode，而是从`oldFiberNode`中取下`alternate`作为`WorkInProgress fiberNode`。除了`pendingProps`是新传入需要更新的属性之外，其他的属性全部都是都从`oldFiberNode`那里复制过来的，这就是为什么上面的代码计算出的结果叫`clone`。而`pendingProps`会在业务代码的生命周期中作为新的文本属性传入，然后组件更新。一个文本组件的更新就完成了。


## updateElement

我们现在看看更为复杂的元素节点是如何实现的，它的区别在于文本节点的`newChild/pendingProps` 是`textContent`,而元素节点则是`element`。

```js
  function updateElement(returnFiber, current, element, lanes) {
    // 如果oldFiberNode也就是current FiberNode存在
    if (current !== null) {
      if (current.elementType === element.type) {
        // 更新fiber，注意划重点了，在文本节点中，useFiber传的的textContext，而在这里传的是element.props
        const existing = useFiber(current, element.props);
        // 创建ref对象
        existing.ref = coerceRef(returnFiber, current, element);
        existing.return = returnFiber;

        return existing;
      }
    }
    // 不存在就是创建一个新的FiberNode
    const created = createFiberFromElement(element, returnFiber.mode, lanes);
    // 创建ref对象
    created.ref = coerceRef(returnFiber, current, element);
    created.return = returnFiber;
    return created;
  }
```

## 节点的实例化细节

```js
// 从上面的代码我们可以知道这里的content是textContent；
// mode是returnFiber.mode，因为本案例还是传统的render模式，所以是BlockingMode，值为0b00010
function createFiberFromText(content,mode,lanes) {
  const fiber = createFiber(HostText, content, null, mode);
  //将lanes赋值给fiber
  fiber.lanes = lanes;
  return fiber;
}

function createFiberFromElement(element,mode,lanes) {
  let owner = null;
  const type = element.type;
  const key = element.key;
  const pendingProps = element.props;
  const fiber = createFiberFromTypeAndProps(type,key,pendingProps,owner,mode,lanes);
  return fiber;
}
// 基于props和type创建fiber，
export function createFiberFromTypeAndProps(type,key,pendingProps,owner,mode,lanes) {
  // 这个函数的主要目的是获取fiber 的type ，它可能是classComponent也可能是HostComponent等等。
  // 至于pendingProps，这个上一个函数已经拿到了就不必计算了
  let fiberTag = IndeterminateComponent;
  let resolvedType = type;
  if (typeof type === 'function') {
    if (shouldConstruct(type)) {
      fiberTag = ClassComponent;
    }
  } else if (typeof type === 'string') {
    fiberTag = HostComponent;
  } else {
    getTag: switch (type) {
       //省去React元素类型判断语句
      default: {
       //省去React元素类型判断语句
        let info = '';
      }
    }
  }

  const fiber = createFiber(fiberTag, pendingProps, key, mode);
  fiber.elementType = type;
  fiber.type = resolvedType;
  fiber.lanes = lanes;
  return fiber;
}
// 最终，无论是文本节点和元素节点都调用了createFiber生成一个新的FiberNode.
const createFiber = function (tag, pendingProps, key, mode) {
  return new FiberNode(tag, pendingProps, key, mode);
};
```

## 全码

```js
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