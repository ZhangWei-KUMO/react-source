---
category: React中概念
order: 1
title: Double Buffering 双缓冲
---
**双缓冲（Double Buffering）**是计算机图形学中一个众所周知的基础概念。其在游戏领域得到了广泛的运用。

在双缓冲的模型中存在两个buffer：**front buffer** 和 **back buffer**。在普通的单缓冲渲染中，我们会直接将数据绘制到video memory中。假设这个数据的位置位于`0xB8000`，当我们修改值的时候自然也就是直接访问内存中`0xB8000`这个位置，然后渲染到显示器上。但是在双缓冲模型中，`0xB8000`则表示**front buffer**，在其存储同时又会创建一个新的内存地址称为**back buffer**。

## 交换缓冲

当数据在写入内存的时候，写入的位置位于 **back buffer**，当数据写入完成之后，双缓冲机制会将 **back buffer**复制到**front buffer**上。这个过程称之为**交换缓冲（swapping the buffers）**。在这种机制下，
用户在显示器上观看**front buffer**的渲染内容时，程序依然可以不间断地往**back buffer**中写入数据。在动画、游戏这类应用中，用户就不会看见像素级别的变动。

## 优点

* 用户不会看到像素级的修改，避免闪屏
* 在缓冲交换（buffer swap）的时候，视频内存是一次性写入，而非对于单个像素进行改动
* 在某些情况下可能需要读取之前已经写入的像素（如：文本滚动条向上翻滚），使用双缓冲就可以直接读取front buffer，而非back buffer，因为从主内存中读取的速度会更快

## 缺点

* 对于用户的硬件有一定的要求
___________________

参考资料：https://wiki.osdev.org/Double_Buffering