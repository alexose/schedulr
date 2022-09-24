// Job processor.
// This code is executed in a sandboxed thread via `vm2`.
const {NodeVM} = require("vm2");
const db = require("./db");
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
    const started = new Date();
    console.log("doing job! " + typeof job.data.code);
    const result = await vm.run(job.data.code, "node_modules")();
    
    // Save job results
    db.writeResult(job.id, started, result);
    done();
};
