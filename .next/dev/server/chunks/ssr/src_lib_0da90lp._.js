module.exports = [
"[project]/src/lib/api.js [app-ssr] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.resolve().then(() => {
        return parentImport("[project]/src/lib/api.js [app-ssr] (ecmascript)");
    });
});
}),
"[project]/src/lib/woocommerce.js [app-ssr] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/ssr/src_lib_woocommerce_014xk4i.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/src/lib/woocommerce.js [app-ssr] (ecmascript)");
    });
});
}),
];