---
category: 其他
order: 6
title: Fiber中的ClassComponentUpdater
---

这是Fiber中最为重要的对象之一，

```js

const classComponentUpdater = {
  isMounted,
  // setState列队方法
  enqueueSetState(inst, payload, callback) {
    // 通过React实例将其转换成fiber对象
    const fiber = getInstance(inst);
    const eventTime = requestEventTime();
    const suspenseConfig = requestCurrentSuspenseConfig();
    const lane = requestUpdateLane(fiber, suspenseConfig);
    //工厂函数返回一个update对象
    const update = createUpdate(eventTime, lane, suspenseConfig);
    update.payload = payload;
    if (callback !== undefined && callback !== null) {
      update.callback = callback;
    }
    // 分别给payload和callback属性赋值，现在只有next属性依然为null
    enqueueUpdate(fiber, update);
    scheduleUpdateOnFiber(fiber, lane, eventTime);
  },
  // 后面两个方法基本相同，不作讨论
  enqueueReplaceState(inst, payload, callback) {
    ...
    update.tag = ReplaceState;
    update.payload = payload;
    ...
   
  },
  enqueueForceUpdate(inst, callback) {
    ...
    update.tag = ForceUpdate;
   ...  
  },
};
```