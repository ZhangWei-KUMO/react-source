---
category: Hooks
order: 12
title: ReactCurrentDispatcher(未完成)
---

如果单看`ReactCurrentDispatcher`是一个非常简单的对象，内部只有一个`current`指针属性。
```js
const ReactCurrentDispatcher = {
  current: null,
};

export default ReactCurrentDispatcher;
```

