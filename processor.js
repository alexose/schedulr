// Job processor.
// This code is executed in a sandboxed thread via `vm2`.
const {NodeVM} = require("vm2");
const db = require("./db");
const vm = new NodeVM({
    require: {
        external: {
            modules: ["puppeteer", "node-fetch", "dirty-json"],
        },
        root: [__dirname],
        wrapper: "none",
    },
});

module.exports = async function (job, done) {
    const started = new Date();
    const jobId = job.opts?.repeat?.jobId || job.id || 0;
    const count = job.opts?.repeat?.count || 0;
    const isTest = job.data?.test;
    let result;
    let error;

    console.log("Running job " + jobId);
    try {
        result = await vm.run(job.data.code, "node_modules")();
    } catch (_error) {
        result = null;
        error = _error;
    }

    console.log("Finished job " + jobId);
    await finish(jobId, started, count, result, error);
    done(error, result);
};

async function finish(jobId, started, count, result, error) {
    await db.writeResult(jobId, started, count, result, error);
}
