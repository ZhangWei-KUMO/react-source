---
category: React中概念
order: 6
title: 单节点diff
---

React在实际业务代码中更新渲染的频率非常高，一次可能会执行几十个fiber对象，但是只有几个组件真正需要重新渲染，也就是其实大多数fiber节点所对应的DOM是不会变动。所以在fiber树进行diff的时候，首先需要考虑的是如何复用当前已经存在的DOM，如何将旧有fiber对象的副本重新返回。

只有最后确认确实存在变动，才会删除fiber child，并重新创建fiber。


在React源码中单节点diff的函数有多个，我们以最常使用的`reconcileSingleElement`为例：

```js
  function reconcileSingleElement(returnFiber,currentFirstChild,element,lanes) {
    const key = element.key;
    let child = currentFirstChild;
    // 检查child是否存在
    while (child !== null) {
      // 对比key的值
      if (child.key === key) {
        switch (child.tag) {
          case Fragment: {
            if (element.type === REACT_FRAGMENT_TYPE) {
              deleteRemainingChildren(returnFiber, child.sibling);
              const existing = useFiber(child, element.props.children);
              existing.return = returnFiber;
              return existing;
            }
            break;
          }
          case Block:
            if (enableBlocksAPI) {
              let type = element.type;
              // 懒加载组件
              if (type.$$typeof === REACT_LAZY_TYPE) {
                type = resolveLazyType(type);
              }
              if (type.$$typeof === REACT_BLOCK_TYPE) {
                // 阻塞组件
                if (type._render ===child.type._render) {
                  deleteRemainingChildren(returnFiber, child.sibling);
                  const existing = useFiber(child, element.props);
                  existing.type = type;
                  existing.return = returnFiber;
                  return existing;
                }
              }
            }
          // 在默认情况下都会将child视为元素，这也是单一diff的核心逻辑代码
          default: {
            if (child.elementType === element.type            
            ) {
              // 删除已有
              deleteRemainingChildren(returnFiber, child.sibling);
              // 复制已有的fiber
              const existing = useFiber(child, element.props);
              existing.ref = coerceRef(returnFiber, child, element);
              existing.return = returnFiber;
              // 把fiber返回出去
              return existing;
            }
            break;
          }
        }
        // 尽管element和child的key相同，但是二者的type不同
        // 故将该fiber删除，且不做任何值的返回
        deleteRemainingChildren(returnFiber, child);
        break;
      } else {
        // 我们可以看见当发现key不同的时候fiber直接就删除该child，并不会做进一步的diff
        deleteChild(returnFiber, child);
      }
      child = child.sibling;
    }
    // 到了这一步，实际上就确定diff出结果，确实存在不同，我们根据元素类型的不同创建不同的fiber
    if (element.type === REACT_FRAGMENT_TYPE) {
      // fragment类型
      const created = createFiberFromFragment(
        element.props.children,
        returnFiber.mode,
        lanes,
        element.key,
      );
      created.return = returnFiber;
      return created;
    } else {
      // 大部分情况都为元素
      const created = createFiberFromElement(element, returnFiber.mode, lanes);
      created.ref = coerceRef(returnFiber, currentFirstChild, element);
      created.return = returnFiber;
      // 返回最终的fiber
      return created;
    }
  }
```
---
本文参考[《React技术揭秘》](https://react.iamkasong.com/diff/one.html#%E7%BB%83%E4%B9%A0%E9%A2%98)