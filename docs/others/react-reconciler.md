---
category: 其他
order: 10
title: React Reconciler
---

**react-reconciler**是一个独立的包，它承接来自**react-dom**,**react-native**,**react-art**,**react-fabric**等第三方渲染器（renderer）包的API，在forks文件夹下做了对接：

```bash
|-ReactFiberHostConfig.dom.js
|-ReactFiberHostConfig.fabric.js
|-ReactFiberHostConfig.art.js
|-ReactFiberHostConfig.native.js
...
```

最终挂载到**ReactFiberHostConfig.custom.js**中的全局变量`$$$hostConfig`中，成为其自身的API进行调用

```js
// ReactFiberHostConfig.custom.js
export const getPublicInstance = $$$hostConfig.getPublicInstance;
export const getRootHostContext = $$$hostConfig.getRootHostContext;
export const getChildHostContext = $$$hostConfig.getChildHostContext;
export const prepareForCommit = $$$hostConfig.prepareForCommit;
...
```

我们以ReactDOM渲染执行环境为例，如果是首次渲染到一个组件，发现该组件是一个HostComponent之后，首先：

```js
  const currentHostContext = getHostContext();
```

获取当前上下文环境，然后创建DOM实例，

```js
 const instance = createInstance(
          type, // 组件类型
          newProps, // props
          rootContainerInstance, // 根容器实例对象
          currentHostContext, // 当前的host上下文环境
          workInProgress,  // workInProgress fiber树
        );
```

我们知道react-reconciler包并不处理DOM，实际这段代码的位置在`react-dom/src/client/ReactDOMHostConfig.js`中：

```js
export function createInstance(
  type,
  props,
  rootContainerInstance:,
  hostContext,
  internalInstanceHandle,
) {
  let parentNamespace;
  parentNamespace = hostContext; 
  // 第一步：创建真实DOM
  // 除了internalInstanceHandle/workInProgress之外，
  // 我们基于传入参数，创建了一个HTML元素,也就是一个真实DOM
  const domElement = createElement(
    type,
    props,
    rootContainerInstance,
    parentNamespace,
  );
  // 第二步：挂载fiber必须的特殊属性
  // 我们将internalInstanceHandle/workInProgress 挂载到这domElement上
  precacheFiberNode(internalInstanceHandle, domElement);
  // 将props值挂载到这domElement上
  updateFiberProps(domElement, props);
  return domElement;
}
```

## 第一步：创建真实DOM

```js
// react-dom/src/client/ReactDOMComponent.js
export function createElement(
  type, 
  props,
  rootContainerElement,
  parentNamespace
) {
  let isCustomComponentTag;

  // 返回Document节点, 也就是document对象
  const ownerDocument = getOwnerDocumentFromRootContainer(
    rootContainerElement,
  );
  let domElement;
  // 通过hostContext创建命令空间的URI
  let namespaceURI = parentNamespace;
  if (namespaceURI === HTML_NAMESPACE) {
    namespaceURI = getIntrinsicNamespace(type);
  }
  if (namespaceURI === HTML_NAMESPACE) {
    if (type === 'script') {
      // Create the script via .innerHTML so its "parser-inserted" flag is
      // set to true and it does not execute
      const div = ownerDocument.createElement('div');
      div.innerHTML = '<script><' + '/script>'; // eslint-disable-line
      // This is guaranteed to yield a script element.
      const firstChild = div.firstChild;
      domElement = div.removeChild(firstChild);
    } else if (typeof props.is === 'string') {
      // $FlowIssue `createElement` should be updated for Web Components
      domElement = ownerDocument.createElement(type, { is: props.is });
    } else {
      // Separate else branch instead of using `props.is || undefined` above because of a Firefox bug.
      // See discussion in https://github.com/facebook/react/pull/6896
      // and discussion in https://bugzilla.mozilla.org/show_bug.cgi?id=1276240
      domElement = ownerDocument.createElement(type);
      // Normally attributes are assigned in `setInitialDOMProperties`, however the `multiple` and `size`
      // attributes on `select`s needs to be added before `option`s are inserted.
      // This prevents:
      // - a bug where the `select` does not scroll to the correct option because singular
      //  `select` elements automatically pick the first item #13222
      // - a bug where the `select` set the first item as selected despite the `size` attribute #14239
      // See https://github.com/facebook/react/issues/13222
      // and https://github.com/facebook/react/issues/14239
      if (type === 'select') {
        const node = domElement;
        if (props.multiple) {
          node.multiple = true;
        } else if (props.size) {
          // Setting a size greater than 1 causes a select to behave like `multiple=true`, where
          // it is possible that no option is selected.
          //
          // This is only necessary when a select in "single selection mode".
          node.size = props.size;
        }
      }
    }
  } else {
    domElement = ownerDocument.createElementNS(namespaceURI, type);
  }
  return domElement;
}
```


**precacheFiberNode**、**updateFiberProps**位于`ReactDOMComponentTree.js`中

```js
export function precacheFiberNode(hostInst, node) {
  node[internalInstanceKey] = hostInst;
}
export function updateFiberProps(node, props) {
  node[internalPropsKey] = props;
}

//实际输出：
// node.__reactProps$123 = {}
// node.__reactFiber$123 = {}
```


## 附属代码

```js
// 当我们传入一个根容器元素之后，无论怎样我们最终都是返回Document节点
function getOwnerDocumentFromRootContainer(rootContainerElement) {
  return rootContainerElement.nodeType === DOCUMENT_NODE
    ? rootContainerElement
    : rootContainerElement.ownerDocument;
}
```