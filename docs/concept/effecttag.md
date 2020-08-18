---
category: React基础概念
order: 20
title: sideEffect
---

编写过React的业务代码的同学都知道，当Component中的`state`和`props`变化时会引起视图的重新渲染，在底层源码中这个过程叫做`sideEffect`，在React源码中一个Component对应着一个FiberNode，每一个FiberNode都会有着`firstEffect`,`lastEffect`,`nextEffect`三个指针属性，它们所指向的对象称为`effect fiber`，它们三个共同维护起一个抽象的`effectList`单向链表。而这个链表就是视图重新渲染的过程。

显然，对于源码不熟悉的同学肯定就听蒙了，所以我们以一个业务代码为案例：

```js
class App extends Component(){
  this.state = {visible:false};
  render(
    return(
      <div>
        <button>
          <span></span>
        </button>
      </div>
    )
  )
}
```

当上面的代码因为state的变动重新渲染时，就会创建一个`effectList`链表,这个虚拟链表的结构如下：

<img style="width:100%" 
src="https://test-1253763202.cos.ap-shanghai.myqcloud.com/docs/react-source/effectlist.drawio.png"/>

## Effect Tags 查询表

Effect Tag的值有32位位掩码从小到大向下排列：

| 名称                         | 值                 | 描述                                                |
| :--------------------------- | :----------------- | :-------------------------------------------------- |
| NoEffect                     | 0b0000000000000000 | FiberNode首次渲染初始状态，不属于effectList链表状态 |
| PerformedWork                | 0b0000000000000001 | 仅为DevTools所使用，不属于effectList链表状态        |
| Placement                    | 0b0000000000000010 | 描述                                                |
| Update                       | 0b0000000000000100 | 描述                                                |
| PlacementAndUpdate           | 0b0000000000000110 | 描述                                                |
| Deletion                     | 0b0000000000001000 | 描述                                                |
| ContentReset                 | 0b0000000000010000 | 描述                                                |
| Callback                     | 0b0000000000100000 | 描述                                                |
| DidCapture                   | 0b0000000001000000 | 描述                                                |
| Ref                          | 0b0000000010000000 | 描述                                                |
| Snapshot                     | 0b0000000100000000 | 描述                                                |
| Passive                      | 0b0000001000000000 | 描述                                                |
| PassiveUnmountPendingDev     | 0b0010000000000000 | 描述                                                |
| Hydrating                    | 0b0000010000000000 | 描述                                                |
| HydratingAndUpdate           | 0b0000010000000100 | 描述                                                |
| LifecycleEffectMask          | 0b0000001110100100 | 描述                                                |
| HostEffectMask               | 0b0000011111111111 | 描述                                                |
| Incomplete                   | 0b0000100000000000 | 描述                                                |
| ShouldCapture                | 0b0001000000000000 | 描述                                                |
| ForceUpdateForLegacySuspense | 0b0100000000000000 | 描述                                                |
| PassiveStatic                | 0b1000000000000000 | 描述                                                |

| StaticMask                   | 0b1000000000000000 | 描述                                                |

### 与subTree相关的effect


| 名称               | 值                 | 描述 |
| :----------------- | :----------------- | :--- |
| BeforeMutationMask | 0b0000001100001010 | 描述 |
| MutationMask       | 0b0000010010011110 | 描述 |
| LayoutMask         | 0b0000000010100100 | 描述 |
| PassiveMask        | 0b0000001000001000 | 描述 |