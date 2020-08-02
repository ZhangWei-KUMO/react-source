/**
 * 整个毕昇项目的根文件
 */
// 导入两个页面模板，一个主页，一个文档
const contentTmpl = "./template/Content/index";

function pickerGenerator(module) {
  const tester = new RegExp(`${module}`);
  return (markdownData) => {
    const { filename } = markdownData.meta;
    if (tester.test(filename)) {
      return {
        meta: markdownData.meta
      };
    }
    return null;
  };
}

module.exports = {
  pick: {
    docs: pickerGenerator("docs")
  },
  plugins: [
    "bisheng-plugin-description",
    // 组件可视化
    "bisheng-plugin-codebox?lang=jsx",
    // 右侧导航栏
    "bisheng-plugin-toc?maxDepth=2&keepElem",
    "bisheng-plugin-antd?injectProvider",
    "bisheng-plugin-react?lang=__react"
  ],
  routes: {
    path: "/",
    component: "./template/Layout/index",
    indexRoute: {
      path: "/docs/introduction/getting_started",
      component: contentTmpl
    },
    childRoutes: [
      {
        path: "docs/:module/:compt/:children",
        component: contentTmpl
      },
      {
        path: "docs/:module/:children",
        component: contentTmpl
      }
    ]
  }
};
