import React from "react";
import { Link } from "bisheng/router";
import zhCn from "../zh-CN";
import { Button, Row, Col } from 'antd';

export default function NotFound({ location }) {
  // eslint-disable-next-line no-console
  return (
    <div id="page-404">
      <section >

        <h1>React17</h1>
        <p>
          源码解析&nbsp;&nbsp;
          <Link to={zhCn.messages["app.home.url"]}>
            <Link to={zhCn.messages["app.home.url"]}>
              <Button type="primary">点击进入</Button>
            </Link>
          </Link>
        </p>
      </section>
      <style dangerouslySetInnerHTML={{ __html: "#react-content { height: 100%; background-color: #fff }" }} />
    </div>
  );
}
