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
    let repeat = undefined;

    if (!obj.code) {
        res.status(400).send("code field is required");
        return;
    }

    if (obj.repeat) {
        repeat = obj.repeat;
        delete obj.repeat;
        console.log(`Adding job with repeat ${repeat}...`);
        jobQueue.add(obj, {jobId: "repeaty-" + Date.now(), repeat: {cron: repeat}});
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
