const Queue = require("bull");
const jobQueue = new Queue("jobs");

module.exports = jobQueue;
