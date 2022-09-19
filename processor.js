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

const code = require("fs").readFileSync("example.txt", "utf-8");

module.exports = async function (job, done) {
    console.log(job.data);
    console.log("doing job! " + job.data.code);

    //const func = vm.run("module.exports = async () => {" + job.data.code + "}");

    const result = await vm.run(code, "node_modules")();
    console.log(result);

    done();
};
