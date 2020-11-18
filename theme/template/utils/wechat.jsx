const APP_ID = "wxe290fb2c147e1302";

async function executeSdk(currentUrl) {
  // 暂不开放微信转发。
  // let server = await fetch("/remote/api/getJsSdkTicket", {
  //   method: "POST",
  //   credentials: "include",
  //   headers: {
  //     'Accept': 'application/json',
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({ currentUrl })
  // });
  // let sign = await server.json();
  // wx.config({
  //   debug: false,
  //   appId: APP_ID,
  //   timestamp: sign.timestamp,
  //   nonceStr: sign.nonceStr,
  //   signature: sign.signature,
  //   jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData']
  // });

}

export default executeSdk;