---
category: React DOM
order: 3
title: React DOM 事件
---

React DOM将事件注册分为不同的插件：

1. SimpleEvent
2. SelectEvent
3. ChangeEvent
4. EnterLeaveEvent
5. BeforeInputEvent

这其中SimleEvent是基础核心事件注册，它定义在`DOMEventProperties.js`中, 所以`registerSimpleEvents`又称`registerEvents`。


同时也把事件分为不同的优先级：

| 名称              | 事件类型     | 优先级 |
| :---------------- | :----------- | :----- |
| DiscreteEvent     | 离散事件     | 0      |
| UserBlockingEvent | 用户阻塞事件 | 1      |
| ContinuousEvent   | 继续事件     | 2      |


这三种类型都隶属于`SimplePluginEvents`。




```js
export function registerSimpleEvents() {
  registerSimplePluginEventsAndSetTheirPriorities(
    discreteEventPairsForSimpleEventPlugin,
    DiscreteEvent,
  );
  registerSimplePluginEventsAndSetTheirPriorities(
    userBlockingPairsForSimpleEventPlugin,
    UserBlockingEvent,
  );
  registerSimplePluginEventsAndSetTheirPriorities(
    continuousPairsForSimpleEventPlugin,
    ContinuousEvent,
  );
  setEventPriorities(otherDiscreteEvents, DiscreteEvent);
}
```

在上面代码中调用了两个函数`registerSimplePluginEventsAndSetTheirPriorities`和`setEventPriorities`。

## listenToNativeEvent

```js
export function listenToNativeEvent(
  domEventName:,
  isCapturePhaseListener,
  rootContainerElement,
  targetElement,
  isPassiveListener?,
  listenerPriority?,
  eventSystemFlags? = PLUGIN_EVENT_SYSTEM,
) {
  let target = rootContainerElement;
  if (domEventName === 'selectionchange') {
      // 由于对于selectionchange只能是document对象的事件，这个事件会经常性触发
      // 如点击文本框，它会触发三个原生事件， focus -> selectionchange -> click
    target = rootContainerElement.ownerDocument;
  }
  // If the event can be delegated (or is capture phase), we can
  // register it to the root container. Otherwise, we should
  // register the event to the target element and mark it as
  // a non-delegated event.
  if (
    targetElement !== null &&
    !isCapturePhaseListener &&
    nonDelegatedEvents.has(domEventName)
  ) {
    // For all non-delegated events, apart from scroll, we attach
    // their event listeners to the respective elements that their
    // events fire on. That means we can skip this step, as event
    // listener has already been added previously. However, we
    // special case the scroll event because the reality is that any
    // element can scroll.
    // TODO: ideally, we'd eventually apply the same logic to all
    // events from the nonDelegatedEvents list. Then we can remove
    // this special case and use the same logic for all events.
    if (domEventName !== 'scroll') {
      return;
    }
    eventSystemFlags |= IS_NON_DELEGATED;
    target = targetElement;
  }
  const listenerMap = getEventListenerMap(target);
  const listenerMapKey = getListenerMapKey(
    domEventName,
    isCapturePhaseListener,
  );
  const listenerEntry = ((listenerMap.get(
    listenerMapKey,
  ): any): ElementListenerMapEntry | void);
  const shouldUpgrade = shouldUpgradeListener(listenerEntry, isPassiveListener);

  // If the listener entry is empty or we should upgrade, then
  // we need to trap an event listener onto the target.
  if (listenerEntry === undefined || shouldUpgrade) {
    // If we should upgrade, then we need to remove the existing trapped
    // event listener for the target container.
    if (shouldUpgrade) {
      removeTrappedEventListener(
        target,
        domEventName,
        isCapturePhaseListener,
        listenerEntry.listener,
      );
    }
    if (isCapturePhaseListener) {
      eventSystemFlags |= IS_CAPTURE_PHASE;
    }
    const listener = addTrappedEventListener(
      target,
      domEventName,
      eventSystemFlags,
      isCapturePhaseListener,
      false,
      isPassiveListener,
      listenerPriority,
    );
    listenerMap.set(listenerMapKey, { passive: isPassiveListener, listener });
  }
}
```