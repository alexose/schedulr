const express = require("express");
const app = express();
const port = 3000;
const config = require("./config.js");
const Queue = require("bull");
const jobQueue = new Queue("jobs");
const path = require("path");

const knex = require("knex")({
    client: "sqlite3",
    connection: {
        filename: "./db.sqlite",
    },
});

jobQueue.empty();
jobQueue.process(path.join(__dirname, "./processor.js"));

jobQueue.on("failed", async function (job, err) {
    console.log(err);
});

app.use(express.json());

app.get("/", (req, res) => {
    res.send("oh hi");
});

app.get("/jobs", async (req, res) => {
    const jobs = await jobQueue.getRepeatableJobs();
    res.send(jobs);
});

app.post("/jobs", async (req, res) => {
    const obj = req.body;
    let every = undefined;

    if (!obj.code) {
        res.status(400).send("code field is required");
        return;
    }

    if (obj.every) {
        every = obj.every;
        delete obj.every;
        console.log(`Adding job with repeat every ${every}...`);
        jobQueue.add(obj, {jobId: "every-" + Date.now(), repeat: {every: every * 1000}});
    } else {
        console.log("Adding single job with no repeat...");
        jobQueue.add(obj);
    }

    const jobs = await jobQueue.getRepeatableJobs();
    res.send(jobs);
});

app.listen(port, () => {
    console.log(`Schedulr listening on port ${port}`);
});
