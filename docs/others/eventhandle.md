---
category: 其他
order: 9
title: ReactDOM.createEventHandle
---

**ReactDOM.createEventHandle** 是最新版的React16所提供的实验性API，它提供了一个事件处理对象用于设置事件监听和清除监听。

我们以一个案例代码来解释：

```js
const clickHandle = ReactDOM.createEventHandle('click')

function Component() {
  const ref = useRef(null);

  useEffect(() => {
    clickHandle.setListener(ref.current, () => {
      console.log('click!');
    });
  });

  return <button ref={ref}>Click me</button>
}
```

在上面的代码中我们并没有在button组件上绑定任何`onClick`事件，但是借助`ReactDOM.createEventHandle('click')`,我们可以对`ref.current`所绑定的DOM进行事件监听。


-----
参考资料：https://github.com/facebook/react/issues/11527