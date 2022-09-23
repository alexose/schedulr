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
    console.log("doing job! " + typeof job.data.code);
    const result = await vm.run(job.data.code, "node_modules")();
    console.log(job.id);

    // Save job results
    done();
};
