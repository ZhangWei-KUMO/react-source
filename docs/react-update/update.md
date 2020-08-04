---
category: React更新
order: 2
title: Update 与 UpdateQueue
---

`update`是记录状态改变的对象,存放于单向链表`UpdateQueue`中。如果在同一个事件中多次调用`setState`方法，就会同时出现多个`update`, 它们会在多个setState创建完成之后，放入`UpdateQueue`中最后一起更新。