// Job processor.
// This code is executed in a sandboxed thread via `vm2`.
const vm2 = require("vm2");

module.exports = function (job, done) {
    console.log("doing job!");

    // call done when finished
    //done();

    // or give an error if error
    // done(new Error("error transcoding"));

    // or pass it a result
    done(null, {result: "boop"});

    // If the job throws an unhandled exception it is also handled correctly
    //throw new Error("some unexpected error");
    return Promise.resolve("boop");
};
