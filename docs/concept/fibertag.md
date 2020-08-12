---
category: React中概念
order: 8
title:  Fiber Tag
---

Fiber的`tag`是fiber概念中非常重要的概念，尤其是对于`workInProgress Fiber`, 在更新fiber的时候不同的tag会执行不同的函数。

| 名称                     | 值      | 解释                                |
| :----------------------- | :------ | :---------------------------------- |
| HostRoot                 | 0b00000 | current Fiber，workInProgress Fiber |
| HostComponent            | 0b00001 | 原生HTMLDOM节点组件通常就是函数组件 |
| ClassComponent           | 0b00010 | Class组件                           |
| HostPortal               | 0b00100 | 解释                                |
| ContextProvider          | 0b01000 | 解释                                |
| Profiler                 | 0b10000 | 解释                                |
| SuspenseComponent        | 0b10000 | 解释                                |
| SuspenseListComponent    | 0b10000 | 解释                                |
| OffscreenComponent       | 0b10000 | 解释                                |
| LegacyHiddenComponent    | 0b10000 | 解释                                |
| IndeterminateComponent   | 0b10000 | 解释                                |
| LazyComponent            | 0b10000 | 解释                                |
| FunctionComponent        | 0b10000 | 解释                                |
| ForwardRef               | 0b10000 | 解释                                |
| Fragment                 | 0b10000 | Fragment组件                        |
| Mode                     | 0b10000 | 解释                                |
| ContextProvider          | 0b10000 | 解释                                |
| ContextConsumer          | 0b10000 | 解释                                |
| SimpleMemoComponent      | 0b10000 | 解释                                |
| IncompleteClassComponent | 0b10000 | 解释                                |
| FundamentalComponent     | 0b10000 | 解释                                |
| ScopeComponent           | 0b10000 | 解释                                |
| Block                    | 0b10000 | 解释                                |
