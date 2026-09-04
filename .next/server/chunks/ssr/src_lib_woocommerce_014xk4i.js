module.exports=[42498,a=>{"use strict";var b=a.i(95414);async function c(a,d=1,e=null){let f="";if(e){let a=JSON.stringify({neon_stack:e}).replace(/"/g,'\\"');f=`, extraData: "${a}"`}let g=`
    mutation AddToCart {
      addToCart(input: { productId: ${a}, quantity: ${d} ${f} }) {
        cart {
          total
        }
      }
    }
  `;return(0,b.fetchGraphQL)(g)}a.s(["addToCart",0,c])}];

//# sourceMappingURL=src_lib_woocommerce_014xk4i.js.map