---
category: 简介
order: 2
title: React基本理论概念
---


## Transformation

React的核心前提是UI只是数据不同形式数据的投影。相同的输入给出相同的输出。一个简单的纯函数。

```js
function NameBox(name) {
  return { fontWeight: 'bold', labelContent: name };
}
```

## Abstraction 抽象

对于复杂的UI显然不可能把所有的代码都放在一个函数中。React UI可以抽象为可重用的片段，而这些片段不会泄漏其实现细节。例如从另一个调用一个函数。

```js
function FancyUserBox(user) {
  return {
    borderStyle: '1px solid blue',
    childContent: [
      'Name: ',
      NameBox(user.firstName + ' ' + user.lastName)
    ]
  };
}
```

## Composition
要实现真正的可重用功能，仅重用叶子并为其构建新容器是不够的。您还需要能够从构成其他抽象的容器中构建抽象。我对“组合”的思考方式是，他们将两个或多个不同的抽象组合成一个新的抽象。

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

UI不仅是服务端/业务逻辑状态的复制。实际上，有很多状态是特定于精确投影的，而不是其他特定状态。例如，如果您开始在文本字段中输入。这可能会或可能不会复制到其他选项卡或您的移动设备。滚动位置是一个典型的示例，您几乎永远不想在多个投影之间进行复制。

我们倾向于选择我们的数据模型是不可变的。我们通过线程来将状态更新为顶部的单个原子。

```js
function FancyNameBox(user, likes, onClick) {
  return FancyBox([
    'Name: ', NameBox(user.firstName + ' ' + user.lastName),
    'Likes: ', LikeBox(likes),
    LikeButton(onClick)
  ]);
}

// Implementation Details

var likes = 0;
function addOneMoreLike() {
  likes++;
  rerender();
}

// Init

FancyNameBox(
  { firstName: 'Sebastian', lastName: 'Markbåge' },
  likes,
  addOneMoreLike
);
```

注意：这些示例使用副作用来更新状态。我的实际心理模型是，他们在“更新”阶段返回了状态的下一个版本。如果没有这些内容，则更容易解释，但将来我们将要更改这些示例。

## Memoization

如果我们知道该函数是纯函数，则一遍又一遍地调用同一函数是浪费的。我们可以创建函数的记忆版本，以跟踪最后一个参数和最后一个结果。这样，如果我们继续使用相同的值，则不必重新执行它。

```js
function memoize(fn) {
  var cachedArg;
  var cachedResult;
  return function(arg) {
    if (cachedArg === arg) {
      return cachedResult;
    }
    cachedArg = arg;
    cachedResult = fn(arg);
    return cachedResult;
  };
}

var MemoizedNameBox = memoize(NameBox);

function NameAndAgeBox(user, currentTime) {
  return FancyBox([
    'Name: ',
    MemoizedNameBox(user.firstName + ' ' + user.lastName),
    'Age in milliseconds: ',
    currentTime - user.dateOfBirth
  ]);
}
```
————————
参考资料：https://github.com/reactjs/react-basic#transformation