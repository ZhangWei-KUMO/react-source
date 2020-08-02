import React from "react";
import { Link } from "bisheng/router";
import classNames from "classnames";
import { Row, Col } from "antd";
import config from "../../../bisheng.config";

class Header extends React.Component {
  render() {
    const headerClassName = classNames({
      clearfix: true
    });
    const { messages } = this.props;
    return (
      <header id="header" className={headerClassName}>
        <Row>
          <Col xxl={4} xl={5} lg={5} md={5} sm={24} xs={24}>
            <a to="#" id="logo">
              <img alt="logo" src={config.baseConfig.logo} />
              <span style={{ fontSize: "17px", color: "#000" }}>
                {config.baseConfig.projectName}
              </span>
            </a>
          </Col>
          <Col xxl={20} xl={19} lg={19} md={19} sm={0} xs={0}>
            <div className="tools-bar">
            </div>
          </Col>
        </Row>
      </header>
    );
  }
}

export default Header;
