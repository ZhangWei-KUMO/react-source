/* eslint-disable react/jsx-props-no-spreading */
import React, { Component, Suspense } from "react";
import { Link } from "react-router";
import {
  Row, Col, Menu, Icon, Affix
} from "antd";
import classNames from "classnames";
import get from "lodash/get";
import MobileMenu from "rc-drawer";
import { injectIntl } from "react-intl";
// import scrollama from "scrollama";
import PrevAndNext from "./PrevAndNext";
import Footer from "../Layout/Footer";
import getModuleData from "../utils/getModuleData";
import getMenuItems from "../utils";
import { getActiveMenuItem, fileNameToPath, getSideBarOpenKeys } from "../utils/handleMenu";
import { getFooterNav, bindScroller } from "../utils/menu";

const Article = React.lazy(() => import("./Article"));

// const scroller = scrollama();

const { SubMenu } = Menu;
class MainContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openKeys: undefined
    };
  }
  static getDerivedStateFromProps(props, state) {
    if (!state.openKeys) {
      return {
        ...state,
        openKeys: screen.width > 700 ? getSideBarOpenKeys(props) : undefined
      };
    }
    return null;
  }


  componentDidUpdate(prevProps) {
    const { location } = this.props;
    const { location: prevLocation = {} } = prevProps || {};
  }


  getMenuItem(footerNavIcons = {}) {
    const { themeConfig, intl } = this.props;
    const { locale } = intl;
    // 核心代码：获取模块数据
    const moduleData = getModuleData(this.props);
    const menuItems = getMenuItems(
      moduleData,
      locale,
      themeConfig.categoryOrder,
      themeConfig.typeOrder
    );
    return menuItems.map((menuItem) => {
      if (menuItem.children) {
        return (
          <SubMenu title={<h4>{menuItem.title}</h4>} key={menuItem.title}>
            {menuItem.children.map((child) => {
              if (child.type === "type") {
                return (
                  <Menu.ItemGroup title={child.title} key={child.title}>
                    {child.children
                      .sort((a, b) => a.title.charCodeAt(0) - b.title.charCodeAt(0))
                      .map((leaf) => this.generateMenuItem(false, leaf, footerNavIcons))}
                  </Menu.ItemGroup>
                );
              }
              return this.generateMenuItem(false, child, footerNavIcons);
            })}
          </SubMenu>
        );
      }
      return this.generateMenuItem(true, menuItem, footerNavIcons);
    });
  }

  handleMenuOpenChange = (openKeys) => {
    this.setState({ openKeys });
  };

  // 生成左侧菜单对象
  generateMenuItem(isTop, item, { before = null, after = null }) {
    const { intl } = this.props;
    const { locale } = intl;
    const key = fileNameToPath(item.filename);
    if (!item.title) {
      return null;
    }
    const title = item.title[locale] || item.title;
    const text = <span key="english">{title}</span>
    const { disabled } = item;
    const url = item.filename.replace(/(\/index)?((\.zh-CN)|(\.en-US))?\.md$/i, "").toLowerCase();
    const child = (
      <Link to={url}>
        {/* {before} */}
        {text}
        {/* {after} */}
      </Link>
    );

    return (
      <Menu.Item key={key.toLowerCase()}
        disabled={disabled}
      >
        {child}
      </Menu.Item>
    );
  }

  render() {
    const { localizedPageData, demos } = this.props;
    const { isMobile } = this.context;
    const { openKeys } = this.state;
    const activeMenuItem = getActiveMenuItem(this.props);

    const menuItems = this.getMenuItem();
    const menuItemsForFooterNav = this.getMenuItem({
      before: <Icon className="footer-nav-icon-before" type="left" />,
      after: <Icon className="footer-nav-icon-after" type="right" />
    });
    const { prev, next } = getFooterNav(menuItemsForFooterNav, activeMenuItem);
    const mainContainerClass = classNames("main-container", {
      "main-container-component": !!demos
    });
    const menuChild = (
      <Menu
        inlineIndent="40"
        className="aside-container menu-site"
        mode="inline"
        inlineCollapsed={false}
        openKeys={openKeys}
        selectedKeys={[activeMenuItem]}
        onOpenChange={this.handleMenuOpenChange}
      >
        {menuItems}
      </Menu>
    );
    return (
      <div className="main-wrapper">
        <Row>
          {isMobile ? null : (
            <Col xxl={4} xl={5} lg={6} md={24} sm={24} xs={24} className="main-menu">
              <section className="main-menu-inner">{menuChild}</section>
            </Col>
          )}
          <Col xxl={20} xl={19} lg={18} md={24} sm={24} xs={24}>
            <Suspense fallback={<div>Loading...</div>}>
              <section className={mainContainerClass}>
                <Article {...this.props} content={localizedPageData} />
              </section>
              <PrevAndNext prev={prev} next={next} />
            </Suspense>
            <Footer />
          </Col>
        </Row>
      </div>
    );
  }
}

export default injectIntl(MainContent);
