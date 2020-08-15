---
category: React基础概念
order: 1
title: Double Buffering 双缓冲机制
---
**双缓冲（Double Buffering）**是计算机图形学中一个众所周知的基础概念。这项技术模型在视频和游戏领域得到了广泛的运用。

在双缓冲的模型中存在两个buffer：**front buffer** 和 **back buffer**。在普通的单缓冲渲染中，我们会直接将数据绘制到video memory中。假设这个数据的位置位于`0xB8000`，当我们修改值的时候自然也就是直接访问内存中`0xB8000`这个位置，然后渲染到显示器上。但是在双缓冲模型中，`0xB8000`则表示**front buffer**，在其存储同时又会创建一个新的内存地址称为**back buffer**。

## 交换缓冲

当数据在写入内存的时候，写入的位置位于 **back buffer**，当数据写入完成之后，双缓冲机制会将 **back buffer**复制到**front buffer**上。这个过程称之为**交换缓冲（swapping the buffers）**。在这种机制下，
用户在显示器上观看**front buffer**的渲染内容时，程序依然可以不间断地往**back buffer**中写入数据。在动画、游戏这类应用中，用户就不会看见像素级别的变动。

简而言之，Double Buffering 双缓冲机制解耦了显示数据和计算数据，你眼镜所看到内容都是已经计算好的数据结果。

### 优点

* 用户不会看到像素级的修改，避免闪屏
* 在**缓冲交换（buffer swap）**的时候，视频内存是一次性写入，而非对于单个像素进行改动
* 在某些情况下可能需要读取之前已经写入的像素（如：文本滚动条向上翻滚），使用双缓冲就可以直接读取front buffer，而非back buffer，因为从主内存中读取的速度会更快

### 缺点

* 对于用户的硬件有一定的要求

## React中双缓冲的实现

既然了解了什么是双缓冲机制，那么在React源码中是如何实现的呢？

React将Fiber分为`current Fiber`和`workInProgress Fiber`两颗树，在浏览器中显示的fiber称为`current Fiber`，而在CPU计算更新的fiber叫`workInProgress Fiber`。

**这两颗树之间通过fiber的`alternate`属性连接，身份互相转换。**

```js
currentFiber.alternate === workInProgressFiber;
workInProgressFiber.alternate === currentFiber;
```

在上面的源码中我们可以看到alternate属性如同指针一样，在两颗树之间相互切换。

那么我们如何用大白话解释这个指针功能呢？

假设此时有一个页面更新结束，`workInProgress fiber`将构建完成的`fiber`交由`renderer`之后，那么当前`currentFiber`就通过`alternate`指针指向`workInProgress fiber`，三秒之后当前页面再次更新,
React生成一个新的`workInProgress`对象，通过`alternate`指针指向当前`currentFiber`进入更新计算。在React不断渲染更新中不断往复循环。

> 解释：fibers从数据结构上来看是一个单向链表，alternate就是这个链表的指针。currentFiber就是fiberRoot所指向的当前显示在浏览器中的fiber对象。随着React的不断更新，指针不断向后指。

## 当我们使用ReactDOM.render()时背后发送了什么？

上面我们讲了什么是双缓冲机制以及React是如何在源码中实现双缓冲机制机制的。那么在实际业务代码中又发生了什么呢？

我们下面看一段非常简单的React代码：

```js
function App() {
  const [num, add] = useState(0);
  return (
    <p onClick={() => add(num + 1)}>{num}</p>
  )
}
// Fiber创建出一个fiberRoot和rootFiber,fiberRoot.corrent指向rootFiber
ReactDOM.render(<App/>, document.getElementById('root'));
```

在这里一定要区分`fiberRoot`和`rootFiber`，这两个概念混淆了后面就没法看了。它们两个都是根节点，但是上面的代码中`fiberRoot`是整个React应用的根节点，而`rootFiber`是`<App/>`根组件的根节点。它们两个有着明确的上下级关系。它们两之间的关系，是通过`fiberRoot.corrent`指向`rootFiber`建立起来的。

```js
fiberRoot.corrent = rootFiber
```

> ⚠️：在React源码中，fiberRoot 就是常量`root`，所以`fiberRoot`才是真正意义上的根节点。

### 首屏渲染

在首屏渲染一开始的时候，`rootFiber`作为`current Fiber`是空，这也是为什么很多大型SPA应用一开始出现白屏的原因。之后React进入**render阶段**，React会在内存中构建`workInProgress Fiber`,在构建完毕后，React进入**commit阶段** ，在这一阶段`fiberRoot`会基于上一个`rootFiber.alternate`指针值，将`fiberRoot.corrent`指向构建完毕的`workInProgress Fiber`。而这个`workInProgress Fiber`就变成了一个新上位的`current Fiber`。

> ⚠️：render阶段，我这里之所以没有用中文“渲染阶段”，是因为怕读者混淆概念。render阶段只是渲染出Fiber树，并非是渲染页面。而渲染页面的工作是在commit阶段完成的。


### 当我们在setState的时候Fiber在干什么

当我们在业务代码中使用`setState`的时候就会触发一次的render渲染，然后初始化一个新的`workInProgress Fiber`。 那么问题来了，`workInProgress Fiber`会和首屏渲染一样重新构建一个新的fiber吗？显然没有那么笨。对于一个应用来说，每次更新只是更新其中一小部分，大部分的DOM并不会发生变动。所以`workInProgress Fiber`首先考虑的是`current Fiber`的复用问题。React的diff算法是采用同级元素diff策略。一级一个fiber，一个fiber一个alternate指针。对于没有发生改变的fiber，React就直接从内存中拿过来就好。

由于这些fiber之间存在父子上下级关系，我们只要和首屏渲染时那样将`fiberRoot.corrent`指向构建完毕的`workInProgress rootFiber`。整个应用更新就完成了。

## 总结

React的核心精髓在于Fiber，Fiber的核心在于Double Buffering。弄懂本文概念是理解React底层逻辑核心的关键所在。

___________________

参考资料：https://wiki.osdev.org/Double_Buffering