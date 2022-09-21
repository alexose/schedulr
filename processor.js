// Job processor.
// This code is executed in a sandboxed thread via `vm2`.
const {NodeVM} = require("vm2");
const vm = new NodeVM({
    require: {
        external: {
            modules: ["puppeteer"],
        },
        root: [__dirname],
        wrapper: "none",
    },
});

module.exports = async function (job, done) {
    console.log(job.data);
    console.log("doing job! " + typeof job.data.code);
    const func = `module.exports = async () => {${job.data.code}}`;

    const result = await vm.run(func, "node_modules")();
    console.log(result);

    done();
};
