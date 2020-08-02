import getMenuItems from "./index";
import getModuleData from "./getModuleData";

export function getActiveMenuItem(props) {
  const { children } = props.params;
  return (
    (children && children.replace("-cn", "")) || props.location.pathname.replace(/(^\/|-cn$)/g, "")
  );
}

export function fileNameToPath(filename) {
  const snippets = filename.replace(/(\/index)?((\.zh-CN)|(\.en-US))?\.md$/i, "").split("/");
  return snippets[snippets.length - 1];
}

// 获取左侧主菜单栏索引值
export const getSideBarOpenKeys = (nextProps) => {
  // 获取主题配置对象
  const { themeConfig } = nextProps;
  // 确定当前文件是的语言版本是zh-CN还是en-US
  const locale = "zh-CN";
  const moduleData = getModuleData(nextProps);
  const shouldOpenKeys = getMenuItems(moduleData, locale, themeConfig.categoryOrder, themeConfig.typeOrder)
    .map((m) => (m.title && m.title[locale]) || m.title);
  return shouldOpenKeys;
};
