/* eslint-disable no-param-reassign */
const path = require("path");
const LodashModuleReplacementPlugin = require("lodash-webpack-plugin");
const packa = require("./package.json");
const { themeConfig, baseConfig } = require("./themeConfig");

const VERSION = packa.version;
const ENV = process.env.NODE_ENV;

const splitChunks = {
  chunks: "async",
  maxSize: 80000,
  minChunks: 5,
  maxAsyncRequests: 5,
  maxInitialRequests: 3,
  automaticNameDelimiter: "~",
  name: true,
  cacheGroups: {
    vendors: {
      test: /[\\/]node_modules[\\/]/,
      priority: -10
    },
    default: {
      minChunks: 2,
      priority: -20,
      reuseExistingChunk: true
    }
  }
};

const babelConfig = {
  loader: "babel-loader",
  test: /\.(js|jsx)$/,
  query: {
    plugins: [
      "lodash",
      ["@babel/plugin-transform-modules-commonjs", {
        allowTopLevelThis: false
      }]
    ],
    presets: [["@babel/env", { targets: { node: 6 } }]]
  }
};

module.exports = {
  // 在这里设置不同环境下的打包路径
  root: ENV === "production" ? "/" : "/",
  devtool: ENV === "production" ? "cheap-module-source-map" : "cheap-module-eval-source-map",
  webpackConfig(config) {
    config.node = {
      fs: "empty",
      child_process: "empty",
      net: "empty",
      module: "empty",
      ejs: "empty"
    };
    if (ENV === "production") {
      config.optimization.minimize = true;
      // config.optimization.splitChunks = splitChunks;
      config.plugins.push(
        new LodashModuleReplacementPlugin()
      );
      config.module.rules.push(babelConfig);

      config.output = {
        filename: `${VERSION}.js`,
        chunkFilename: `bundle.${VERSION}.js`
      };
    }

    return config;
  },
  source: {
    docs: "./docs"
  },
  output: "./dist",
  theme: "./theme",
  htmlTemplate: path.join(__dirname, "./theme/static/template.html"),
  lessConfig: {
    javascriptEnabled: true
  },
  themeConfig,
  baseConfig
};
