---
category: React基础概念
order: 9
title: Renderer
---

在React中对于渲染器有着级别之分，分为**PrimaryRenderer**和**SecondaryRenderer**。

在浏览器端：

* ReactDOM是PrimaryRenderer
* ReactART是SecondaryRenderer（用于绘制Canvas和SVG）

在移动端：

* React Native是PrimaryRenderer
* Fabric 是SecondaryRenderer