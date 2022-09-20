import initSwc, { transformSync } from '@swc/wasm-web';
import system from 'systemjs';

await initSwc();

const systemJSPrototype = system.constructor.prototype;

systemJSPrototype.shouldFetch = function () {
  return true;
};

systemJSPrototype.fetch = async (url: string, options) => {
  const res = await fetch(url, options);

  if (!res.ok) return res;

  if (res.url.endsWith('.ts')) {
    const source = await res.text();
    const {code , map } = transformSync(source)
  
    return new Response(new Blob([`${code}\n${map}`], { type: 'application/javascript'}))
  }

  return res
}


