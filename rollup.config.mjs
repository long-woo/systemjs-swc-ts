import { readFileSync } from 'node:fs'

import resolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";
import typescript from '@rollup/plugin-typescript'

/**
 * 文件头说明
 * @param {*} name 包名
 * @param {*} fileName 文件名
 * @param {*} version 版本号
 */
const generateBanner = (name, fileName, version) => {
  return `/*! **************************************************
** ${name}(${fileName})
** version ${version}
** (c) long.woo
** https://github.com/long-woo/systemjs-swc-ts
*************************************************** */\n`;
};

const buildFormat = (fileName) => ({
  iife: {
    outFile: `${fileName}.js`,
    format: "iife",
    mode: "development",
  },
  "iife-prod": {
    outFile: `${fileName}.min.js`,
    format: "iife",
    mode: "production",
  },
});

/**
 * 获取配置
 * @param {*} param
 * outFile 输出文件名
 * format 编译文件类型
 * mode 编译环境
 */
const getConfig = ({ outFile, format, mode }, pkg) => {
  const isProduction = mode === "production";

  const version = pkg.version;
  const external = Object.keys({ ...(pkg.peerDependencies || "") });

  const globals = external.reduce((prev, current) => {
    prev[current] = current;

    return prev;
  }, {});

  return {
    input: "src/index.ts",
    output: {
      file: `dist/${outFile}`,
      banner: generateBanner(pkg.name, outFile, version),
      globals,
      format,
      name: "SytemJSSWCTS",
      exports: "auto",
    },
    plugins: [
      typescript(),
      resolve(),
      json(),
      isProduction &&
        terser({
          format: {
            comments: /long\.woo/,
          },
        }),
    ],
    external,
  };
};

const build = () => {
  const pkg = JSON.parse(readFileSync(`./package.json`))
  const format = buildFormat(pkg.displayName);

  return Object.keys(format).map((key) => getConfig(format[key], pkg));
};

const buildConfig = build();

export default buildConfig;
