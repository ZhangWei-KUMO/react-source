---
category: 简介
order: 4
title: React不使用JSX
---

JSX不是使用React的必要条件。当您不想在构建环境中设置编译时，我们也可以直接编写React代码。虽然在业务代码中我们一般不会这么干，但是直接写纯js的React代码更有利于我们理解源码。

假设我们有一段简单的JSX代码

```js
class Hello extends React.Component {
  render() {
    return <div>Hello {this.props.toWhat}</div>;
  }
}
ReactDOM.render(
  <Hello toWhat="World" />,
  document.getElementById('root')
);
```

如果在纯js中，我们可以编写：

```js
class Hello extends React.Component {
  render() {
    return React.createElement('div', null, `Hello ${this.props.toWhat}`);
  }
}
ReactDOM.render(
  React.createElement(Hello, {toWhat: 'World'}, null),
  document.getElementById('root')
);
```

## 那么问题来了，上面的代码在执行的时候源码中发生了什么？

**createElement**的源码位于`ReactElement.js`中,源码如下：

```js
// 这里type可以是原生HTML字符串，如'div',也可以是自定义组件Hello
// config里包含了元素中所有的属性，既有React保留属性，也有用户自定义的...props,
// 此时它们还在同一个对象中混在一起
export function createElement(type, config, children) {
  let propName;
  // 用户自定义属性
  const props = {};
  // React元素四大保留属性
  let key = null;
  let ref = null;
  let self = null;
  let source = null;
  // creatElement函数第一步就是对config对象进行梳理，用户自定义的props归props，保留属性归保留属性。
  if (config != null) {
    // 对于保留属性ref赋值
    if (hasValidRef(config)) {
      ref = config.ref;
    }
    // 对于保留属性key赋值
    if (hasValidKey(config)) {
      key = '' + config.key;
    }
     // 对于保留属性self，source赋值
    self = config.__self === undefined ? null : config.__self;
    source = config.__source === undefined ? null : config.__source;
    // 拿到用户自定义的属性对象
    for (propName in config) {
      if (
        hasOwnProperty.call(config, propName) &&
        !RESERVED_PROPS.hasOwnProperty(propName)
      ) {
        // 这个时候我们完成从config到props的转换
        props[propName] = config[propName];
      }
    }
  }

  // 接着我们来处理children，对于ReactElement来说，就算业务代码children参数为null，它也是一个chilren
  const childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    // 正常情况下childrenLength === 1，不管是字符串也好，null也罢。
    // 都将children挂载到我们刚才已经创建好的props里，这也是为什么我们能从
    // 业务代码中通过props.children获取我们自定义组件嵌套内容的原因
    props.children = children;
  } else if (childrenLength > 1) {
    // 尽管源码中createElement(type, config, children) 规定了三个参数，但是对于开发者而言，
    // 它要是写4个参数乃至100个，你也拦不住。所以将第三个之后所有的参数都视为children数组。
    const childArray = Array(childrenLength);
    for (let i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    props.children = childArray;
  }
   // 在这里React会检查defaultProps，这个是React15.5之前class Component中存在
  // 的static defaultProps对象，但是目前PropTypes库所取代，但是React的源码中依然保留了这段源码用以对旧项目的支持
  if (type && type.defaultProps) {
    const defaultProps = type.defaultProps;
    for (propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName];
      }
    }
  }
  // 最后我们使用ReactElement工厂函数的方式最终将ReactElement对象返回，一个React元素构建成功了。
  return ReactElement(
    type,
    key,
    ref,
    self,
    source,
    ReactCurrentOwner.current, 
    props,
  );
}
```

## 等等？好像还有疑问？ReactCurrentOwner.current是什么鬼？

**ReactCurrentOwner**是一个普通对象，它内部只有一个指针属性**current**，它表示当前所创建的这个ReactElement所属的Fiber是谁。这个在后面讲到Fiber的时候会了解这是一个核心概念，它贯穿了整个Fiber的生命周期。

```js
// ReactFiberBeginWork.js

// 当我们完成了整个组件构建后
function finishClassComponent(current,workInProgress,Component,shouldUpdate,hasContext,renderLanes){
  ...
  // 获取当前fiber实例
  const instance = workInProgress.stateNode;
  // ReactCurrentOwner.current指针指向了workInProgress fiber对象,比如常见的
  // ReactDOM.render(<App/>, document.getElementById('root')) 在这里就指向了
  // 正在计算的 <App/> Fiber
  // 这就在ReactElement与fiber之间建立桥梁关系
  ReactCurrentOwner.current = workInProgress;
  let nextChildren;
  // 渲染当前fiber实例
  nextChildren = instance.render();
  ...
}
}
```

但在ReactElement初始化的时候，它的值是`null`，所以这里我们一笔带过。

## ReactElement内部是否还有未知世界？

```js
// ReactElement方法是一个工厂函数用于创建一个React元素，它直接返回对象，所以要注意不要使用new关键字
const ReactElement = function (type, key, ref, self, source, owner, props) {
  const element = {
    $$typeof: REACT_ELEMENT_TYPE,    //  划重点
    type: type,
    key: key,
    ref: ref,
    props: props,
    _owner: owner,
  };
  return element;
};
```

果然不出所料，**ReactElement**并不是简单地返回一个对象，这里多了一个`$$typeof: REACT_ELEMENT_TYPE`字段，它用于标记当前创建的ReactElement对象的`ReactElement-like（类React元素）`类型。

### 什么是ReactElement-like类型？

尽管大多数情况下`$$typeof`的值都是**REACT_ELEMENT_TYPE**，也就是React元素类型，但是它并非是唯一。随着React的发展逐渐有了懒加载、`<Suspense/>`、`<Provider/>`、`<Context/>`这些概念，它们内置于React中以内置组件的形式出现在我们的业务代码中，看起来也非常像React元素，所以我们称之为`ReactElement-like（类React元素）`类型。而`$$typeof`的值，并不是简单一个数值赋值，而是使用ES6中新增的数据类型`Symbol`赋值的。现在我们进入下一节《Symbol在React中的应用》。

----
参考资料：https://reactjs.org/docs/react-without-jsx.html