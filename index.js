const express = require("express");
const app = express();
const port = 3000;
const config = require("./config.js");
const Queue = require("bull");
const jobQueue = new Queue("jobs");
const path = require("path");
const http = require("http");
const db = require("./db");
const socket = require("./socket");
const broadcast = socket.broadcast;

/*
jobQueue.empty();
jobQueue.clean(0, "delayed");
jobQueue.clean(0, "wait");
jobQueue.clean(0, "active");
jobQueue.clean(0, "completed");
jobQueue.clean(0, "failed");
let multi = jobQueue.multi();
multi.del(jobQueue.toKey('repeat'));
multi.exec();
*/

const server = http.createServer(app);

jobQueue.process(path.join(__dirname, "./processor.js"));

jobQueue.on("failed", async function (job, err) {
    console.log(err);
});

jobQueue.on("active", async function (job, err) {
    const data = job?.opts?.repeat?.jobId;
    broadcast({event: "job_start", data});
});

jobQueue.on("failed", function (job, err) {
    const data = job?.opts?.repeat?.jobId;
    broadcast({event: "job_failed", data});
});

jobQueue.on("completed", function (job, err) {
    const data = job?.opts?.repeat?.jobId;
    broadcast({event: "job_completed", data});
});

app.use(express.json());

app.get("/api/", (req, res) => {
    res.send("oh hi");
});

app.get("/api/jobs", async (req, res) => {
    // Get jobs out of bull/redis
    let jobs = await jobQueue.getRepeatableJobs();

    // Get last results out of sqlite
    jobs = await db.augmentResults(jobs);

    res.send(jobs);
});

app.post("/api/jobs", async (req, res) => {
    const obj = req.body;

    if (!obj.code) {
        res.status(400).send("code field is required");
        return;
    }

    const {name, every, ...data} = obj;

    if (every) {
        console.log(`Adding ${name}, repeating every ${every} seconds...`);
        await jobQueue.add(data, {jobId: name, repeat: {every: every * 1000}});
        broadcastJobs();
    } else {
        console.log(`Adding ${name} with no repeat...`);
        jobQueue.add(data, {jobId: name});
    }

    const jobs = await jobQueue.getRepeatableJobs();
    res.send(jobs);
});

app.get("/api/results", async (req, res) => {
    const results = await db.getResults();
    res.send(results);
});

app.get("/api/jobs/:id", async (req, res) => {
    const results = await db.getResults(req.params.id);
    res.send(results);
});

app.delete("/api/jobs/:key", async (req, res) => {
    const {key} = req.params;
    const result = await jobQueue.removeRepeatableByKey(key);
    await broadcastJobs();
    res.send(result);
});

async function broadcastJobs() {
    const jobs = await jobQueue.getRepeatableJobs();
    broadcast({event: "jobs_list", data: jobs});
}

socket.init(server);

server.listen(port, () => {
    console.log(`Schedulr listening on port ${port}`);
});
