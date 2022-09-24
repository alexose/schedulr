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
    const {jobId, count} = job.opts.repeat;
    console.log("Running job " + jobId);
    const result = await vm.run(job.data.code, "node_modules")();

    // Save job results
    db.writeResult(jobId, started, count, result);
    done();
};
