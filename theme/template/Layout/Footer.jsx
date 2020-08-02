import React, { useEffect } from "react";
import { injectIntl } from "react-intl";

const Footer = (props) => {
  const { intl } = props;
  const { messages } = intl;
  const year = new Date().getFullYear();
  return (
    <footer id="footer">
      <div className="bottom-bar">
        <a target="_blank" rel="noopener noreferrer" href="http://www.beian.gov.cn">
          {messages["app.footer.name"]}
        </a>
        © 2019 -
        {""}
        {year}
      </div>
    </footer>
  );
};

export default injectIntl(Footer);
