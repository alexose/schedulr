const express = require("express");
const app = express();
const port = 3000;
const config = require("./config.js");
const Queue = require("bull");
const jobQueue = new Queue("jobs");
const path = require("path");

jobQueue.process(path.join(__dirname, "./processor.js"));

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.get("/jobs", (req, res) => {
    res.send("jobz");
});

app.post("/jobs", (req, res) => {
    const obj = req.body;
    let repeat = null;

    if (obj.repeat) {
        repeat = obj.repeat;
        delete obj.repeat;
    }

    if (!obj.code) {
        res.status(400).send("code field is required");
        return;
    }

    jobQueue.add(obj, {repeat: {cron: repeat}});

    res.send("jobz");
});

app.listen(port, () => {
    console.log(`Schedulr listening on port ${port}`);
});
