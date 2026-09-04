(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,95695,e=>{"use strict";async function t(e,r={}){let o=await fetch("https://darkblue-raven-747036.hostingersite.com/graphql",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:e,variables:r})}),n=await o.json();if(n.errors)throw console.error(n.errors),Error("Failed to fetch API");return n.data}async function r(){let e=await t(`
    query GetProducts {
      products(first: 20) {
        nodes { id name slug image { sourceUrl } }
      }
    }
  `);return e?.products?.nodes.map(e=>[e.name,"Premium LED Neon",e.image?.sourceUrl||"/images/products/product_01.png","","4,999"])||[]}async function o(){let e=await t(`
    query GetCategories {
      productCategories(where: { parent: 0 }, first: 20) {
        nodes {
          id name slug
          children(first: 10) { nodes { id name slug } }
        }
      }
    }
  `);return e?.productCategories?.nodes||[]}async function n(e){let t=await fetch(`https://darkblue-raven-747036.hostingersite.com/wp-json/neon-stack/v2/config?configurator=${e}`);return t.ok?t.json():(console.error("Failed to fetch configurator",await t.text()),null)}e.i(47167),e.s(["fetchGraphQL",0,t,"getCategories",0,o,"getConfiguratorOptions",0,n,"getProducts",0,r])},30997,e=>{e.v(e=>Promise.resolve().then(()=>e(95695)))},30129,e=>{e.v(t=>Promise.all(["static/chunks/35_54xp29nt9m.js"].map(t=>e.l(t))).then(()=>t(84800)))}]);