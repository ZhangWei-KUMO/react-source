// 分享给微信和QQ好友或群
export function updateAppMessageShareData(link, title, imgUrl, desc = "") {
  wx.ready(() => {
    wx.updateAppMessageShareData({
      title: `${title}- react-source 中文文档`,
      desc,
      link,
      imgUrl,
      success() {
        console.log("分享成功");
      }
    });
  });
}

// 分享朋友圈
export function updateTimelineShareData(link, title, imgUrl) {
  wx.ready(() => {
    wx.updateTimelineShareData({
      title: `${title} - React源码解析`,
      link,
      imgUrl,
      success() {
        console.log("分享成功");
      }
    });
  });
}
