const baseConfig = {
  logo: "https://zh-hans.reactjs.org/favicon.ico",
  projectName: "React17 源码解析",
  homeUrl: "/index.html",
  library: "https://github.com/ZhangWei-KUMO/react-source"
};

const themeConfig = {
  categoryOrder: {
    简介: 1,
    React基础概念: 2,
    "React DOM": 3,
    "React Fiber": 4,
    React更新: 5,
    懒加载: 6,
    Hooks: 7,
    服务端渲染: 8,
    其他: 10
  },
  typeOrder: {
    "react-source 必考点": 1,
    基础教程: 2,
    高级教程: 3
  }
};

module.exports = { themeConfig, baseConfig };
