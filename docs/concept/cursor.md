---
category: React基础概念
order: 19
title: Cursor指针
---

在React源码中由于Fibers是一个链表结构，自然**指针（cursor）**是一个非常重要的概念，在React中cursor的数据结构是一个stack，所以指针又被称为**StackCursor**，根据功能的不同分为五种，分别为：

1. rootInstanceStackCursor        // 管理根节点实例(dom对象)
3. contextFiberStackCursor       // 管理fiber节点
4. contextStackCursor           // 管理namespaces
5. didPerformWorkStackCursor   // 管理context是否改变
6. suspenseStackCursor        // 管理suspense

无论是哪种方式它们的实例化都通过`createCursor`方法生成一个空对象,并在`ReactFiberStack`中维护一个stack,随着fiber的变化通过pop，push方法移动`current`指针及`index`索引值。

## push和pop方法

我们在接触具体操作之前看看React中stack的底层基本操作：

```js
// stack初始为一个空数组
const valueStack = [];
// 索引值初始值为-1
let index = -1;

// push方法接受三个参数
function push(cursor, value, fiber) {
  // 每执行一次索引值自增一次
  index++;
  // 在这里我们可以看到当，cursor传入后，我们拿到它的current属性，将该值放入栈中的某个位置上
  valueStack[index] = cursor.current;
  // 更新指针，赋值新值
  cursor.current = value;
}

function pop(cursor, fiber) {
  // 只有在stack的索引值大于等于0，是stack才执行pop操作
  if (index < 0) {
    return;
  }
  // 更新指针，将指针指向当前值，也就是回退一步
  cursor.current = valueStack[index];
  // 然后将当前值设置为null
  valueStack[index] = null;
  // 索引值自减
  index--;
}
```

通过上面的代码我们可以看出`push`和`pop`在代码逻辑顺序上是整好相反的，`push`比`pop`多一个参数`value`，也就是stack增加元素后，指针指向的下一个对象。但是第三个参数`fiber`都没有被使用到。上面其实就是一个简单的js实现stack数据结构的代码，说的比较抽象，我们以一个简单的例子来说明，当然`ReactFiber`开始运行的时候，它的执行顺序是:

1. `beginWork()` 发现运行的第一个fiber树的tag是`HostRoot`
2. `pushHostRootContext(workInProgress:Fiber)` 从fiber树上拿到容器信息
3. `pushHostContainer(workInProgress, root.containerInfo)` 在这里`containerInfo`就是下一个root实例

我们一起看看`pushHostContainer`内部运行的细节是什么？

```js
function pushHostContainer(fiber, nextRootInstance) {
  // 初始时，rootInstanceStackCursor是个空对象，nextRootInstance就是当前项目容器，fiber
  push(rootInstanceStackCursor, nextRootInstance, fiber);
  // 初始时，contextFiberStackCursor是个空对象，context栈的指针下一个就是指向当前fiber
  push(contextFiberStackCursor, fiber, fiber);

  push(contextStackCursor, NO_CONTEXT, fiber);
  const nextRootContext = getRootHostContext(nextRootInstance);
  // Now that we know this function doesn't throw, replace it.
  pop(contextStackCursor, fiber);
  //
  push(contextStackCursor, nextRootContext, fiber);
}
```

> didPerformWorkStackCursor和contextStackCursor是同等级指针


## contextStackCursor


## rootInstanceStackCursor

我们以`rootInstanceStackCursor`为例，

---
参考资料： [图解React](http://www.7km.top/main/context#%E5%85%A8%E5%B1%80%E5%8F%98%E9%87%8F)