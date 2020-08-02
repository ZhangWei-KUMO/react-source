# Vue 2.16.11 源码分析

## 语言的配置

### 默认语言设置

/Layout/index.jsx中进行设置默认显示语言

```js
 constructor(props) {
    super(props);
    const { location } = this.props;
    this.state = {
      // 设置默认语言
      appLocale: location.pathname.indexOf("en") > -1 ? enUs : zhCn
    };
  }
```

### 性能优化

在chrome控制台command+shift+p 调出搜索框搜索`Show Coverage`,查看JS文件的使用率。一般情况下只有使用率达到70%，就是属于优秀的JS代码加载。


