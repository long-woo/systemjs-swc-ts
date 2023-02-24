import initSwcWeb, { transformSync } from "@swc/wasm-web";

let initialized = false;
const initSwc = async () => {
  if (initialized) return;
  console.log("swc init");
  await initSwcWeb();
  initialized = true;
  console.log("swc end");
};

const _global = (typeof self !== "undefined" ? self : global) as any;

const systemJSPrototype = _global.System.constructor.prototype;
const jsonCssWasmContentType =
  /^(application\/json|application\/wasm|text\/css)(;|$)/;
const registerRegEx =
  /System\s*\.\s*register\s*\(\s*(\[[^\]]*\])\s*,\s*\(?function\s*\(\s*([^\\),\s]+\s*(,\s*([^\\),\s]+)\s*)?\s*)?\)/;

systemJSPrototype.shouldFetch = function () {
  return true;
};

// const fetch = systemJSPrototype.fetch;

systemJSPrototype.fetch = async (url: string, options: RequestInit) => {
  await initSwc();
  const res = await fetch(url, options);

  if (
    !res.ok ||
    jsonCssWasmContentType.test(res.headers.get("content-type") ?? "")
  )
    return res;

  const source = await res.text();

  if (registerRegEx.test(source))
    return new Response(new Blob([source], { type: "application/javascript" }));

  const { code } = transformSync(source, {
    jsc: {
      parser: {
        syntax: "typescript",
        tsx: true,
      },
      target: "es2020",
    },
    module: {
      type: "systemjs",
    },
    isModule: true,
    sourceMaps: "inline",
  });

  if (
    [
      "http://localhost:10011/workbench/navbar/src/main.ts",
      "http://localhost:10011/workbench/navbar/node_modules/.vite/deps/vue.js?v=1ed1d076",
    ].includes(url)
  ) {
    console.log(code);
  }
  return new Response(new Blob([code], { type: "application/javascript" }));
};
