const express = require("express");
const app = express();
const port = 3000;
const config = require("./config.js");
const Queue = require("bull");
const jobQueue = new Queue("jobs");
const path = require("path");
const WebSocket = require("ws");
const http = require("http");

const knex = require("knex")({
    client: "sqlite3",
    connection: {
        filename: "./db.sqlite",
    },
});

//jobQueue.empty();

/*
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
const wss = new WebSocket.Server({server});
let ws;

wss.on("connection", _ws => {
    ws = _ws;

    ws.on("message", message => {
        console.log(`received: %s`, message);
        ws.send(`Hello, you sent -> ${message}`);
    });

    ws.send(`Hi there, I am a WebSocket server`);
    console.log("connected");
});

jobQueue.process(path.join(__dirname, "./processor.js"));

jobQueue.on("failed", async function (job, err) {
    console.log(err);
});

app.use(express.json());

app.get("/api/", (req, res) => {
    res.send("oh hi");
});

app.get("/api/jobs", async (req, res) => {
    const jobs = await jobQueue.getRepeatableJobs();
    res.send(jobs);
});

app.post("/api/jobs", async (req, res) => {
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

server.listen(port, () => {
    console.log(`Schedulr listening on port ${port}`);
});
