// Job processor.
// This code is executed in a sandboxed thread via `vm2`.
const {NodeVM} = require("vm2");
const vm = new NodeVM({
    require: {
        root: "./node_modules",
    },
});

module.exports = function (job, done) {
    console.log(job.data);
    console.log("doing job! " + job.data.code);

    //const func = vm.run("module.exports = async () => {" + job.data.code + "}");

    const str = `
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto('https://news.ycombinator.com/')
    `;

    console.log(func());

    // call done when finished
    //done();

    // or give an error if error
    // done(new Error("error transcoding"));

    // or pass it a result

    // If the job throws an unhandled exception it is also handled correctly
    //throw new Error("some unexpected error");
    return Promise.resolve(result);
};
