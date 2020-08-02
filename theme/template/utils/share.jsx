// 分享给微信和QQ好友或群
export function updateAppMessageShareData(link, title, imgUrl, desc = "") {
  wx.ready(() => {
    wx.updateAppMessageShareData({
      title: `${title}- react-source 中文文档`,
      desc,
      link,
      imgUrl: "https://pic3.zhimg.com/v2-ce20bde69af4312361237259e5f775f6_r.jpg?source=172ae18b",
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
      title: `${title} - react-source 中文文档`,
      link,
      imgUrl: "https://pic3.zhimg.com/v2-ce20bde69af4312361237259e5f775f6_r.jpg?source=172ae18b",
      success() {
        console.log("分享成功");
      }
    });
  });
}
