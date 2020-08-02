export function flattenMenu(menu) {
  if (!menu) {
    return null;
  }
  if (menu.type && menu.type.isMenuItem) {
    return menu;
  }
  if (Array.isArray(menu)) {
    return menu.reduce((acc, item) => acc.concat(flattenMenu(item)), []);
  }
  return flattenMenu((menu.props && menu.props.children) || menu.children);
}

export function getFooterNav(menuItems, activeMenuItem) {
  const menuItemsList = flattenMenu(menuItems);
  let activeMenuItemIndex = -1;
  menuItemsList.forEach((menuItem, i) => {
    if (menuItem && menuItem.key === activeMenuItem) {
      activeMenuItemIndex = i;
    }
  });
  const prev = menuItemsList[activeMenuItemIndex - 1];
  const next = menuItemsList[activeMenuItemIndex + 1];
  return { prev, next };
}

// export function bindScroller(scroller) {
//   const elements = scroller.setup({ step: ".markdown > h2, .code-box", offset: 0 });
//   if (elements) {
//     elements.onStepEnter(({ element }) => {
//       if (element) {
//         Array.prototype.forEach.call(document.querySelectorAll(".toc-affix li a"), (node) => {
//           node.className = "";
//         });
//         const currentNode = document.querySelectorAll(`.toc-affix li a[href="#${element.id}"]`)[0];
//         if (currentNode) {
//           currentNode.className = "current";
//         }
//       }
//     });
//   }
// }
