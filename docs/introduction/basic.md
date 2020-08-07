---
category: 简介
order: 2
title: React的设计理念
---

本文将以非常简单的代码跟大家讲解React的基本设计理念。尽管没有涉及到具体细节（如：算法优化等），但是正是这些简单的代码构筑起React库的基础设计理念。下面我们就来看看React源码在基础设计上的这些理念。

## 由对象到UI的转换

React的核心前提**是UI只是数据不同形式数据的映射**。相同的输入给出相同的输出。React的本质就是一个简单的纯函数。

```js
function NameBox(name) {
  return { fontWeight: 'bold', labelContent: name };
}
```

## 细节抽象

对于复杂的UI显然不可能把所有的代码都放在一个函数中。对于具体细节的抽象可以让整个源码变得简单易懂。

```js
function FancyUserBox(user) {
  return {
    borderStyle: '1px solid blue',
    childContent: [
      'Name: ',
      // 在这里我们抽象了NameBox函数
      NameBox(user.firstName + ' ' + user.lastName)
    ]
  };
}
```

## 抽象合并

在实际源码中，仅仅通过父子节点的关系对于函数抽象复用显然是远远不够的。更多地是一个函数由多个抽象函数组合。  

```js
function FancyBox(children) {
  return {
    borderStyle: '1px solid blue',
    children: children
  };
}

function UserBox(user) {
  return FancyBox([
    'Name: ',
    NameBox(user.firstName + ' ' + user.lastName)
  ]);
}
```

## State

React UI不仅是服务端/业务逻辑状态的一个映射副本。实际上，有很多状态是特定于精确投影的，而不是其他特定状态。例如，如果您开始在文本字段中输入。这可能会或可能不会复制到其他选项卡或您的移动设备。滚动位置是一个典型的示例，您几乎永远不想在多个投影之间进行复制。

React在设计state的时候，它遵循state在业务代码中是`immutable`特性，需要通过线程函数进行修改：
```js
function FancyNameBox(user, likes, onClick) {
  return FancyBox([
    'Name: ', NameBox(user.firstName + ' ' + user.lastName),
    'Likes: ', LikeBox(likes),
    LikeButton(onClick)
  ]);
}
var likes = 0;
 // 我们通过线程函数对like进行增量
function addOneMoreLike() {
  likes++;
  rerender();
}

FancyNameBox(
  { firstName: 'Sebastian', lastName: 'Markbåge' },
  // 而不是在这里直接对likes赋值
  likes,
  addOneMoreLike
);
```

## Memoization 内存化

如果我们知道该函数是纯函数，显然一遍又一遍地调用同一函数是计算机性能浪费。对于经常可能使用到的值我们可以采取缓存措施。

```js
// 缓存函数
function memoize(fn) {
  var cachedArg;
  var cachedResult;
  return function(arg) {
    // 如果新传入的参数与已缓存的参数一致，则直接返回缓存内容
    if (cachedArg === arg) {
      return cachedResult;
    }
    // 新传入的参数进行缓存
    cachedArg = arg;
    cachedResult = fn(arg);
    // 
    return cachedResult;
  };
}

var MemoizedNameBox = memoize(NameBox);

function NameAndAgeBox(user, currentTime) {
  return FancyBox([
    'Name: ',
    // 在这里对用户信息进行缓存
    MemoizedNameBox(user.firstName + ' ' + user.lastName),
    'Age in milliseconds: ',
    currentTime - user.dateOfBirth
  ]);
}
```

## 列表设计

对于大部分UI来说，列表是最常见的展现方式。对于列表来说，它的每一个item中都会有一个独立的state，在React中通过`Array.prototype.map()`方法对于列表进行遍历，然后通过Maps实例对这些item的state进行存储。

```js
function UserList(users, likesPerUser, updateUserLikes) {
  // map当前数组
  return users.map(user => FancyNameBox(
    user,
    likesPerUser.get(user.id),
    // 针对每一个单独的item进行state更新
    () => updateUserLikes(user.id, likesPerUser.get(user.id) + 1)
  ));
}
// 实例化一个map
var likesPerUser = new Map();
// 存储state
function updateUserLikes(id, likeCount) {
  likesPerUser.set(id, likeCount);
  rerender();
}
// 渲染一个列表
UserList(data.users, likesPerUser, updateUserLikes);
```

## 函数柯里化

我们上面提到了列表渲染，像类似这样的常用代码会经常使用。为了保证业务代码的逻辑清晰，React源码中会采用函数柯里化的方式进行编码。也就是将某个常用函数作为模板，借助`bind`方法进行调用：

```js
function FancyUserList(users) {
  return FancyBox(
    // 针对上面的代码，我们可以通过函数柯里化进行简化，将UserList抽象出来。
    UserList.bind(null, users)
  );
}
```

## Algebraic Effects | React中Context是什么？

Algebraic Effects是一种新型的编程思想，它的作用是在没有中间件的情况两个抽象函数之间传递信息,它自身有点像一个全局信息收集器。在React中称为`Context`。

```js
function ThemeBorderColorRequest() { }

function FancyBox(children) {
  const color = raise new ThemeBorderColorRequest();
  return {
    borderWidth: '1px',
    borderColor: color,
    children: children
  };
}
// 
function BlueTheme(children) {
  return try {
    children();
  } catch effect ThemeBorderColorRequest -> [, continuation] {
    continuation('blue');
  }
}
// 假设这里是的APP函数
function App(data) {
  // 比起传统直接返回逻辑业务代码， Algebraic Effects函数在外包裹了一层
  return BlueTheme(
    FancyUserList.bind(null, data.users)
  );
}
```
-------
参考资料：https://github.com/reactjs/react-basic