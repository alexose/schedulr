const express = require("express");
const app = express();
const port = 3000;
const config = require("./config.js");
const Queue = require("bull");
const jobQueue = new Queue("jobs");
const path = require("path");

jobQueue.empty();
jobQueue.process(path.join(__dirname, "./processor.js"));

jobQueue.on("failed", async function (job, err) {
    console.log(err);
});

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.get("/jobs", (req, res) => {
    res.send("jobz");
});

app.post("/jobs", (req, res) => {
    const obj = req.body;
    let repeat = undefined;

    if (!obj.code) {
        res.status(400).send("code field is required");
        return;
    }

    if (obj.repeat) {
        repeat = obj.repeat;
        delete obj.repeat;
        jobQueue.add(obj, {repeat: {cron: repeat}});
    } else {
        console.log("Adding job with no repeat...");
        jobQueue.add(obj);
    }

    res.send("jobz");
});

app.listen(port, () => {
    console.log(`Schedulr listening on port ${port}`);
});
