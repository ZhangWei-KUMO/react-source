import React from "react";
import { Link } from "bisheng/router";
import classNames from "classnames";
import { Row, Col } from "antd";
import config from "../../../bisheng.config";

class Header extends React.Component {
  switchLanguage = () => {
    const { href, pathname } = window.location;
    if (pathname === "/icecream/") {
      window.location.href = `${href}index-cn`;
      return;
    }
    if (/\/?index-en/.test(pathname)) {
      const newHref = href.replace("index-en", "index-cn");
      window.location.href = newHref;
      return;
    }
    if (/\/?index-cn/.test(pathname)) {
      const newHref = href.replace("index-cn", "index-en");
      window.location.href = newHref;
      return;
    }
    if (/\/?\/cn/.test(pathname)) {
      const newHref = href.replace("/cn/", "/en/");
      window.location.href = newHref;
    } else {
      const newHref = href.replace("/en/", "/cn/");
      window.location.href = newHref;
    }
  }

  render() {
    const headerClassName = classNames({
      clearfix: true
    });
    const { messages } = this.props;
    return (
      <header id="header" className={headerClassName}>
        <Row>
          <Col xxl={4} xl={5} lg={5} md={5} sm={24} xs={24}>
            <Link to="/" id="logo">
              <img alt="logo" src={config.baseConfig.logo} />
              <span style={{ fontSize: "17px", color: "#000" }}>{config.baseConfig.projectName}</span>
            </Link>
          </Col>
          <Col xxl={20} xl={19} lg={19} md={19} sm={0} xs={0}>
            <div className="tools-bar">
              {/* <button
                  className="header-switch"
                  onClick={this.switchLanguage}
                  tabIndex={0}
                  type="button"
                >
                  {messages["app.header.lang"]}
                </button> */}
            </div>
          </Col>
        </Row>
      </header>
    );
  }
}

export default Header;
