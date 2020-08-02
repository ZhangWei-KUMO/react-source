/* eslint-disable no-throw-literal */
import collect from "bisheng/collect";
import MainContent from "./MainContent";

export default collect(async (nextProps) => {
  const { pathname } = nextProps.location;
  const pageDataPath = pathname.split("/");

  const pageData = nextProps.utils.get(nextProps.data, pageDataPath);
  if (!pageData) {
    throw 404;
  }

  return { localizedPageData: pageData };
})(MainContent);
