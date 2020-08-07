---
category: React中概念
order: 4
title: Fiber架构
---

什么是Fiber架构，Acdlite在2016年曾经撰文过一篇《[React Fiber Architecture](https://github.com/acdlite/react-fiber-architecture)》专门用于介绍Fiber。本文就是对该文的中文翻译。

## 简介

React Fiber是对React核心算法的不断重新实现。这是React团队经过两年多研究的结晶。React Fiber的目标是提高其对动画，布局和手势等区域的适用性。它的首要特性是加强渲染：将渲染工作分成多个块并将其分布到多个帧中的能力。

其他的新增能力包括当新的update进来后，React具有暂停，中止或复用当前work的能力，可以为不同类型的update分配优先级；以及原生的支持并非能力。

## 什么是 reconciliation?

**reconciliation**是一种算法的名称，React使用该算法将一棵Tree与另一棵Tree进行比较，以确定哪些部分需要更改。**update**用于呈现React应用程序的数据中的更改。通常是setState的结果，最终导致页面重新渲染。

> 注：reconciliation在中文有对账的意思，这对于diff算法有着非常形象的比喻。

React API的中心设计思想被认为就是用于整个应用的重新渲染，开发者通过声明的方式即可更新页面。

对于一个应用来说，它每一次的重新渲染可能只是一个非常细微的变动。在传统的Real DOM中对于浏览器的性能开销非常大，而React可在保持出色性能的同时创建整个应用程序重新渲染的外观。而这个性能优化的过程我们称之为**reconciliation**。

**reconciliation**被视为支撑"virtual DOM"背后的算法，严格意义上来说：当你渲染一个React应用时，在内存中会生成和存储一个用于描述应用的节点树。这个树后面会被放入渲染环境。例如，对于浏览器应用程序，它被转换为一组DOM操作。当你更新的时候（通常就是setState），一个新的树就会生成，新树与前一棵树进行比较，以计算更新呈现的应用程序所需的操作。

尽管Fiber是对reconciler的重写，但是在算法角度依然相同，其关键点在于：

1. 不同类型的component生成不同的子树，对于这些树。React就不做diff了，而是采取新树替代旧树的方式；
2. 在list上，diff必须使用到`key`属性。

### Reconciliation与渲染

DOM只是React渲染出来的结果之一，它还可以渲染基于React Native的原生iOS和Android视图（这就是为什么 "virtual DOM"有的名不副实的原因）。之所以React可以支持多个平台，它的原因就在于Reconciliation与渲染是分开独立的两个步骤。reconciler负责计算出tree中哪些部分发生了变动，renderer将这个tree最终渲染到某个执行环境中。这种分离意味着React DOM和React Native可以使用自己的渲染器，同时共享由React core提供的同一reconciler。

由于Fiber是对于Reconciliation的重写，你可以大致上认为Fiber与渲染无关。

## 调度

#### scheduling

确定何时应执行工作的过程

#### work

通常是指setState更新结果

React的设计原则在调度这个层面表现非常不错，我们在这里引述一下：



## 什么是Fiber

接下来我们将讨论React Fiber体系结构的核心——fiber,fiber是比应用程序开发人员通常想到的低得多的抽象。刚开始接触的时候，对于开发者来说是比较难以理解。但是没关系，我们一步步来：

Fiber的主要目标是使React能够利用调度的优势。如:

1. 暂停当前work，延迟一会;
2. 为不同类型的work分配优先级;
3. 复用之前已经完成的work;
4. 对于不需要的work，可以终止。

为了实现以上目标，我们需要将一个更新分解成若干个fiber work，开发者可以将fiber视为一个work的单位。

对于React渲染组件来说，我们通常可以用以下函数进行表达：

```js
v = f(d)
```

渲染React应用程序类似于调用一个函数，该函数的主体包含对其他函数的调用，依此类推。当考虑纤维时，这种类比很有用。

计算机通常使用`call stack`来跟踪程序执行的方式。当函数执行时，新的`stack frame`将添加到堆栈中。该`stack frame`表示正在执行的工作。处理UI时，问题在于如果一次执行太多工作，可能会导致动画掉帧并显得断断续续。

较新的浏览器（和React Native）实现了有助于解决此确切问题的API：`requestIdleCallback`安排在空闲期间调用的低优先级函数，而`requestAnimationFrame`安排在下一个动画帧调用的高优先级函数。问题在于，为了使用这些API，您需要一种将渲染工作分解为增量单位的方法。如果仅依靠`call stack`，它将继续工作直到堆栈为空。如果我们可以自定义调用堆栈的行为来优化呈现UI，那不是很好吗？如果我们可以随意中断调用堆栈并手动操作堆栈帧，那不是很好吗？这就是React Fiber的目的。光纤是堆栈的重新实现，专门用于React组件。您可以将单根fiber视为`virtual stack frame`。重新实现堆栈的优点是，您可以将堆栈帧保留在内存中，并根据需要（以及在任何时候）执行它们。这对于实现我们计划的目标至关重要。除了调度之外，手动处理堆栈帧还可以释放并发和错误边界等功能。我们将在以后的章节中介绍这些主题。

在下一节中，我们将更多地研究fiber的结构。

### fiber的结构

具体来说，fiber是一个JavaScript对象，其中包含有关组件，其输入和输出的信息。fiber不仅对应了一个stack frame，也对应一个组件实例。

下面是属于fiber的一些重要字段：

#### type 与 key

`type`字段告诉React 当前fiber所对应的组件是什么类型，如：函数组件、class组件、还是原生HTML。
`key`作为React作为fiber的唯一标识符，它与`type`字段存在着合作关系，当我们在diff算法的时候，在特定情况下可以重复使用当前fiber。

#### child 与 sibling

我们知道fiber本身是一个树结构，`child`和`sibling`描述了组件节点之间的关系，在下面的代码中我们很清楚地看到它们之间的父子兄弟关系。

```js
function Parent() {
  // return一个单向链表
  return [<Child1 />, <Child2 />]
}
```
#### return


#### pendingProps 与 memoizedProps

如果只是从设计概念上来看，`props`仅仅是函数所传入的参数，对于fiber来说`pendingProps`是在fiber尚未执行时进行设置，
而`memoizedProps`则在fiber执行结束之后设置。这个两个属性的作用在于，当fiber判断两个属性值相同时，在执行更新函数的时候便直接复用上一次的输出值，避免不必要的计算。

#### pendingWorkPriority

一个32位数值用以表示当前task work的优先级。

#### alternate

fiber分为两种状态：

1. flushed fiber
2. workInProgress fiber

**flush**的作用在于将output对象，最终渲染到屏幕上。
**workInProgress**表示正在进行中的fiber。从设计概念上来说就是尚未返回`stack frame`的fiber对象。

**alternate字段是一个非常重要字段，里面包含了fiber大量的细节值得源码阅读者自行阅读。**

#### output

**host component**：React应用程序的叶节点，如div,span。

从设计概念上来看fiber的output，是函数返回值。所有的fiber最终都会有返回值，都会转换成**host component**并挂载到tree上。最后都是提供给渲染执行环境。而render的作用就在于定义output是如何被创建和更新。

