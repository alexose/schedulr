// Job processor.
// This code is executed in a sandboxed thread via `vm2`.
const {NodeVM} = require("vm2");
const db = require("./db");
const vm = new NodeVM({
    require: {
        external: {
            modules: ["puppeteer", "node-fetch"],
        },
        root: [__dirname],
        wrapper: "none",
    },
});

module.exports = async function (job, done) {
    const started = new Date();
    const jobId = job.opts?.repeat?.jobId || 0;
    const count = job.opts?.repeat?.count || 0;
    const test = job.opts?.test;

    console.log("Running job " + jobId);
    try {
        const result = await vm.run(job.data.code, "node_modules")();

        if (!test) {
            await db.writeResult(jobId, started, count, result);
        }
        done(null, result);
    } catch (error) {
        if (!test) {
            await db.writeResult(jobId, started, count, null, error);
        }
        done(error);
    }
};
