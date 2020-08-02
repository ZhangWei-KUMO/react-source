function getModuleData(props) {
  const { pathname } = props.location;

  const moduleName = pathname
    .split("/")
    .filter((item) => item)
    .slice(0, 1)
    .join("/");
  const moduleData = props.picked[moduleName];
  return moduleData;
}

export default getModuleData;
