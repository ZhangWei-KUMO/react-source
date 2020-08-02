// export const handleInitialHashOnLoad = () => {
//   setTimeout(() => {
//     if (!window.location.hash) {
//       return;
//     }
//     const element = document.getElementById(
//       decodeURIComponent(window.location.hash.replace("#", ""))
//     );
//     if (element && document.documentElement.scrollTop === 0) {
//       element.scrollIntoView();
//     }
//   }, 0);
// };

export const onResourceClick = (e) => {
  if (!window.gtag) {
    return;
  }
  const cardNode = e.target.closest(".resource-card");
  if (cardNode) {
    window.gtag("event", "resource", {
      event_category: "Download",
      event_label: cardNode.href
    });
  }
  if (
    window.location.href.indexOf("docs/recommendation") > 0
    && e.target.matches(".markdown > table td > a[href]")
  ) {
    window.gtag("event", "recommendation", {
      event_category: "Click",
      event_label: e.target.href
    });
  }
};
