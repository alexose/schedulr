const {defineConfig} = require("@vue/cli-service");
const host = "localhost";
const port = 3000;
module.exports = defineConfig({
    transpileDependencies: true,
    devServer: {
        proxy: {
            "/api": {
                target: `http://${host}:${port}/`,
                secure: false,
                ws: true,
                changeOrigin: true,
            },
        },
    },
});
