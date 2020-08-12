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

## getNodeFromInstance

上面我们提到了如何从React Node中初始化一个fiber实例，**getNodeFromInstance**则与之相反
```js
export function getNodeFromInstance(inst) {
  // 当我确定一个fiber实例的tag是一个原生HTML组件或是原生文本时，我们将其返回成React Node
  if (inst.tag === HostComponent || inst.tag === HostText) {
    // 在当前的fiber 实例中它只是一个状态节点，但是我们假设它是一个host Component或者host text 
    return inst.stateNode;
  }
}
```

## getFiberCurrentPropsFromNode

从React中的Node中获取FiberProps，这个方法通常是在DOM监听中使用。

```js
// 从当前node中获取props
export function getFiberCurrentPropsFromNode(node) {
  return node[internalPropsKey] || null;
}
```

## updateFiberProps

更新props,我们可以看到这就是一个简单赋值行为。它在**createInstance**、**commitUpdate**、**hydrateInstance**时会触发props更新，这也就是说在ReactDOM创建实例和提交更新的时候会被触发。

```js
export function updateFiberProps(node, props) {
  node[internalPropsKey] = props;
}
```