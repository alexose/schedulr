const express = require("express");
const app = express();
const port = 3001;
const config = require("./config.js");
const jobQueue = require("./jobQueue.js");
const path = require("path");
const http = require("http");
const db = require("./db");
const socket = require("./socket");
const broadcast = socket.broadcast;

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
    const test = job?.data?.test;
    if (test) {
        console.log("test_failed_" + job.id);
        broadcast({event: "test_failed_" + job.id, data: job});
    } else {
        broadcast({event: "job_failed", data});
    }
});

jobQueue.on("completed", function (result, err) {
    if (result.data.test) {
        console.log("test_completed_" + result.id);
        broadcast({event: "test_completed_" + result.id, data: result});
    } else {
        broadcast({event: "job_completed", data: result?.opts?.repeat?.jobId});
    }
});

app.use(express.json());

app.get("/api/", (req, res) => {
    res.send("oh hi");
});

app.get("/api/jobs", async (req, res) => {
    // Get jobs out of bull/redis
    const jobs = await db.getJob();
    res.send(jobs);
});

app.post("/api/jobs", async (req, res) => {
    const obj = req.body;

    if (!obj.code) {
        res.status(400).send("code field is required");
        return;
    }

    const result = await db.addJob(obj);
    res.send(result);
});

app.put("/api/jobs/:id", async (req, res) => {
    const {id} = req.params;
    const obj = req.body;

    if (!obj.code) {
        res.status(400).send("code field is required");
        return;
    }

    obj.job_id = id;
    const jobs = await db.editJob(obj);
    res.send(jobs);
});

app.post("/api/testjob", async (req, res) => {
    const obj = req.body;

    if (!obj.code) {
        res.status(400).send("code field is required");
        return;
    }

    const {name, every, ...data} = obj;
    data.test = true;
    console.log(`Testing "${name}"...`);

    const job = await jobQueue.add(data, {jobId: name});
    const result = await job.finished();

    res.send(result);
});

app.get("/api/results", async (req, res) => {
    const results = await db.getResults();
    res.send(results);
});

app.get("/api/results/:id", async (req, res) => {
    const {id} = req.params;
    const result = await db.getResult(id);
    res.send(result);
});

app.get("/api/jobs/:id", async (req, res) => {
    const {id} = req.params;
    const {json} = req.query;
    let filters = null;

    if (json) {
        filters = JSON.parse(json);
    }

    const job = await db.getJob(id);
    const results = await db.getResults(id, filters);

    res.send({job, results});
});

app.delete("/api/jobs/:id", async (req, res) => {
    const {id} = req.params;
    const result = await db.deleteJob(id);
    await broadcastJobs();
    res.send(result);
});

app.use("/", express.static(__dirname + "/dist"));
app.use("/*", express.static(__dirname + "/dist"));

async function broadcastJobs() {
    const jobs = await jobQueue.getRepeatableJobs();
    broadcast({event: "jobs_list", data: jobs});
}

socket.init(server);

server.listen(port, () => {
    console.log(`Schedulr listening on port ${port}`);
    db.sync();
});
