module.exports = [
"[project]/src/lib/woocommerce.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addToCart",
    ()=>addToCart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api.js [app-ssr] (ecmascript)");
;
async function addToCart(productId, quantity = 1, neonStackData = null) {
    let extraData = "";
    if (neonStackData) {
        const jsonStr = JSON.stringify({
            neon_stack: neonStackData
        });
        const escapedJson = jsonStr.replace(/"/g, "\\\"");
        extraData = `, extraData: "${escapedJson}"`;
    }
    const query = `
    mutation AddToCart {
      addToCart(input: { productId: ${productId}, quantity: ${quantity} ${extraData} }) {
        cart {
          total
        }
      }
    }
  `;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fetchGraphQL"])(query);
}
}),
];

//# sourceMappingURL=src_lib_woocommerce_014xk4i.js.map