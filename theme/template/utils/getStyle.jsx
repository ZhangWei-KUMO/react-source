function getStyle() {
  return `
    .main-wrapper {
      padding: 0;
    }
    #header {
      box-shadow: none;
      max-width: 1200px;
      width: 100%;
      margin: 20px auto 0;
      padding: 0 24px;
    }
    #header,
    #header .ant-select-selection,
    #header .ant-menu {
      background: transparent;
    }
    #header #logo {
      padding: 0;
    }
    #header #nav .ant-menu-item {
      border-color: transparent;
    }
    #header #nav .ant-menu-submenu {
      border-color: transparent;
    }
    #header #nav .ant-menu-item.hide-in-home-page {
      display: none;
    }
    #header .ant-row > div:last-child .header-lang-button {
      margin-right: 0;
    }
    footer .footer-wrap {
      width: 100%;
      max-width: 1200px;
      padding: 86px 24px 93px 24px;
      margin: auto;
    }
    @media only screen and (max-width: 767.99px) {
      #footer .footer-wrap {
        padding: 40px 24px;
      }
      footer .footer-wrap .ant-row {
        padding: 0;
      }
    }
    .home-logo {
      width:300px;
      height:300px
    }
    .container {
      width:80%;
      margin:20px auto;
    }
    .container h1 {
      font-size:46px;
      font-weight:300;
    }
    .container .home-btns {
      margin-top:30px
    }
    .home {
      padding:0px 40px;
      min-height:700px
    }
  `;
}

export default getStyle;