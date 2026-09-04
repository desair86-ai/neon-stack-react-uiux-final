(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,84800,t=>{"use strict";var a=t.i(95695);async function r(t,e=1,o=null){let n="";if(o){let t=JSON.stringify({neon_stack:o}).replace(/"/g,'\\"');n=`, extraData: "${t}"`}let c=`
    mutation AddToCart {
      addToCart(input: { productId: ${t}, quantity: ${e} ${n} }) {
        cart {
          total
        }
      }
    }
  `;return(0,a.fetchGraphQL)(c)}t.s(["addToCart",0,r])}]);