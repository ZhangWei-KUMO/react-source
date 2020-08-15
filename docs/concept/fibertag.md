---
category: React基础概念
order: 8
title:  React组件类型
---

React的组件类型分为：**原生组件**，**有状态组件**，**无状态组件**，**懒加载组件**，**缓存组件**，**性能组件**。我们下面一一讲解：


| 名称                     | 值      | 解释                                                             |
| :----------------------- | :------ | :--------------------------------------------------------------- |
| HostRoot                 | 0b00000 | current Fiber，workInProgress Fiber                              |
| HostComponent            | 0b00001 | 原生HTMLDOM节点组件通常就是函数组件                              |
| ClassComponent           | 0b00010 | Class组件                                                        |
| HostPortal               | 0b00100 | Portal组件                                                       |
| Profiler                 | 0b10000 | Profiler性能测试组件                                             |
| SuspenseComponent        | 0b10000 | Suspense组件                                                     |
| SuspenseListComponent    | 0b10000 | SuspenseList组件                                                 |
| LegacyHiddenComponent    | 0b10000 | 隐藏组件                                                         |
| LazyComponent            | 0b10000 | 懒加载组件                                                       |
| FunctionComponent        | 0b10000 | 函数组件                                                         |
| ForwardRef               | 0b10000 | `React.ForwardRef`调用                                           |
| Fragment                 | 0b10000 | Fragment组件                                                     |
| Mode                     | 0b10000 | React运行模式                                                    |
| ContextConsumer          | 0b10000 | ContextConsumer 组件                                             |
| ContextProvider          | 0b01000 | ContextProvider组件                                              |
| MemoComponent            | 0b10000 | 缓存组件，通过`React.memo`调用                                   |
| SimpleMemoComponent      | 0b10000 | 简式缓存组件，通过`React.memo`调用，一般情况MemoComponent 的形态 |
| IncompleteClassComponent | 0b10000 | 未完成Class组件                                                  |

## 原生组件

原生组件是react呈现试图的基石，HostRoot是所有渲染的起点。它一共分为以下四类

* HostRoot
* HostPortal
* HostComponent
* HostText
  
## 有状态组件

* ClassComponent
* ContextConsumer
* ContextProvider

## 无状态组件

* FunctionComponent
* IndeterminateComponent
* ForwardRef
* SimpleMemoComponent

## 特别鸣谢

本文参考前端前辈司徒正美先生的遗作[React16的组件类型](https://zhuanlan.zhihu.com/p/55000793),愿先生在天堂里安息。