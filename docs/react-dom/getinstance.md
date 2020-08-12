---
category: React DOM
order: 2
title: React DOM的API
---

`getInstanceFromNode`应该ReactDOM最常被调用的内置API了，它的作用在于基于node生成Fiber对象。


```js
const randomKey = Math.random()
  .toString(36)
  .slice(2);
const internalInstanceKey = '__reactFiber$' + randomKey;
const internalContainerInstanceKey = '__reactContainer$' + randomKey;

// 当在react组件中拿到一个react node对象后，我们将其生成一个fiber对象。
function getInstanceFromNode(node) {
  // 给其赋值上一个随机值，作为当前firber
  const inst = node[internalInstanceKey] || node[internalContainerInstanceKey];
  if (inst) {
    if (
      inst.tag === HostComponent ||
      inst.tag === HostText ||
      inst.tag === SuspenseComponent ||
      inst.tag === HostRoot
    ) {
      // 我们会发现其实还是原路返回。
      return inst;
    } else {
      return null;
    }
  }
  return null;
}
```