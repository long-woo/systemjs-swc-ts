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
const jsonCssContentType = /^(application\/json|application\/|text\/css)(;|$)/;
const registerRegEx =
  /\s*(\/\*[^\\*]*(\*(?!\/)[^\\*]*)*\*\/|\s*\/\/[^\n]*)*\s*System\s*\.\s*register\s*\(\s*(\[[^\]]*\])\s*,\s*\(?function\s*\(\s*([^\\),\s]+\s*(,\s*([^\\),\s]+)\s*)?\s*)?\)/;

systemJSPrototype.shouldFetch = function (url: string) {
  console.log("url", url);
  return true;
};

systemJSPrototype.fetch = async (url: string, options: RequestInit) => {
  console.log("systemJSPrototype.fetch", url);
  const res = await fetch(url, options);

  if (!res.ok || jsonCssContentType.test(res.headers.get("content-type") ?? ""))
    return res;
  const source = await res.text();

  await initSwc();

  if (registerRegEx.test(source))
    return new Response(new Blob([source], { type: "application/javascript" }));

  const { code } = transformSync(source, {
    jsc: {
      parser: {
        syntax: "typescript",
        tsx: true,
      },
      target: "es5",
    },
    module: {
      type: "systemjs",
    },
    isModule: true,
    sourceMaps: "inline",
  });
  console.log("code", code);
  return new Response(new Blob([code], { type: "application/javascript" }));
};
