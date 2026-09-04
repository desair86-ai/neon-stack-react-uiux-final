module.exports=[69789,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});var d={actionAsyncStorage:function(){return f.actionAsyncStorage},workAsyncStorage:function(){return g.workAsyncStorage},workUnitAsyncStorage:function(){return h.workUnitAsyncStorage}};for(var e in d)Object.defineProperty(c,e,{enumerable:!0,get:d[e]});let f=a.r(20635),g=a.r(56704),h=a.r(32319);("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},95414,a=>{"use strict";async function b(a,c={}){let d=await fetch("https://darkblue-raven-747036.hostingersite.com/graphql",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:a,variables:c})}),e=await d.json();if(e.errors)throw console.error(e.errors),Error("Failed to fetch API");return e.data}async function c(){let a=await b(`
    query GetProducts {
      products(first: 20) {
        nodes { id name slug image { sourceUrl } }
      }
    }
  `);return a?.products?.nodes.map(a=>[a.name,"Premium LED Neon",a.image?.sourceUrl||"/images/products/product_01.png","","4,999"])||[]}async function d(){let a=await b(`
    query GetCategories {
      productCategories(where: { parent: 0 }, first: 20) {
        nodes {
          id name slug
          children(first: 10) { nodes { id name slug } }
        }
      }
    }
  `);return a?.productCategories?.nodes||[]}async function e(a){let b=await fetch(`https://darkblue-raven-747036.hostingersite.com/wp-json/neon-stack/v2/config?configurator=${a}`);return b.ok?b.json():(console.error("Failed to fetch configurator",await b.text()),null)}a.s(["fetchGraphQL",0,b,"getCategories",0,d,"getConfiguratorOptions",0,e,"getProducts",0,c])},65207,a=>{a.v(a=>Promise.resolve().then(()=>a(95414)))},31789,a=>{a.v(b=>Promise.all(["server/chunks/ssr/src_lib_woocommerce_014xk4i.js"].map(b=>a.l(b))).then(()=>b(42498)))}];

//# sourceMappingURL=_01ntt6j._.js.map