---
category: 其他
order: 2
title: stack 在 React Fiber中的应用
---

React对于stack的定义位于`ReactFiberStack.js`文件，

```js
// 文件中维护一个valueStack，
const valueStack = [];
// 索引值初始值为-1
let index = -1;

function createCursor(defaultValue) {
  return {
    // current的指针是stack的唯一字段
    current: defaultValue,
  };
}
// 检查是否为空stack
function isEmpty() {
  return index === -1;
}

function pop(cursor, fiber) {
  if (index < 0) {
    return;
  }
  // 
  cursor.current = valueStack[index];
  // 将当前指针位置清空
  valueStack[index] = null;
  // 索引值自减
  index--;
}

function push(cursor, value, fiber) {
  index++;
  valueStack[index] = cursor.current;
  cursor.current = value;
}

export {
  createCursor,
  isEmpty,
  pop,
  push,
};
```
