const jobQueue = require("./jobQueue.js");
const jsonDiff = require("json-diff");
const socket = require("./socket");
const broadcast = socket.broadcast;

const knex = require("knex")({
    client: "sqlite3",
    useNullAsDefault: true,
    connection: {
        filename: "./db.sqlite",
    },
});

// Create jobs table
knex.schema.hasTable("jobs").then(function (exists) {
    if (!exists) {
        return knex.schema.createTable("jobs", function (t) {
            t.increments("id").primary();
            t.string("job_id");
            t.string("code");
            t.integer("every");
            t.datetime("last_run");
            t.datetime("last_change");
            t.string("last_result");
        });
    }
});

// Create results table
knex.schema.hasTable("results").then(function (exists) {
    if (!exists) {
        return knex.schema.createTable("results", function (t) {
            t.increments("id").primary();
            t.string("data");
            t.string("error");
            t.string("job_id");
            t.string("diff");
            t.integer("count");
            t.datetime("started");
            t.datetime("finished");
        });
    }
});

// Add a job to the database and ensure that job is added to the queue
async function addJob(obj) {
    const {name, every, ...data} = obj;
    if (every) {
        console.log(`Adding ${name}, repeating every ${every} minutes...`);

        // Add job to queue, but also run immediately
        await jobQueue.add(data, {jobId: name, repeat: {every: every * 1000 * 60}});
        await jobQueue.add(data, {jobId: name + "-first"});

        // Record job in database
        await writeJob(obj);
    } else {
        // One-off jobs don't get recorded for now
        console.log(`Adding ${name} with no repeat...`);
        jobQueue.add(data, {jobId: name});
    }

    const jobs = await jobQueue.getRepeatableJobs();
    return jobs;
}

// Sync database with queue.  Our strategy here is that the database is the source of truth.
// If we find a job that exists in the DB but not in the queue, we create it.
// Vise versa, we delete it.
async function sync() {
    const qj = await jobQueue.getRepeatableJobs();

    // TODO: turn this into a stream
    const dj = await knex("jobs").select();
    dj.forEach(job => {
        const match = qj.find(d => d.id === job.job_id);
        if (!match) {
            // Create the job and make a note that it hasn't been running?
        }
    });

    qj.forEach(async job => {
        const match = dj.find(d => d.job_id === job.id);
        if (!match) {
            await jobQueue.removeRepeatableByKey(job.key);
            console.log(dj, job.job_id);
            console.log(`No match for ${job.id}. Removing from queue...`);
        }
    });
}

// Edit an existing job, then remove + re-add job to queue
async function editJob(obj) {
    const {name, every, ...data} = obj;
    console.log(`Editing ${name}, repeating every ${every} seconds...`);
    await jobQueue.add(data, {jobId: name, repeat: {every: every * 1000}});
    await writeJob(obj);
    const jobs = await jobQueue.getRepeatableJobs();
    return jobs;
}

// Remove an existing job, then remove from queue
async function deleteJob(job_id) {
    await knex("jobs").where({job_id}).delete();
    await jobQueue.removeRepeatableByKey(job_id);
    return job_id;
}

async function writeJob(obj) {
    const {name, ...rest} = obj;
    const job = await knex("jobs")
        .insert({job_id: name, ...rest})
        .catch(e => {
            console.error(e);
        });
    return job;
}

async function writeResult(jobId, started, count, data, error, isTest) {
    const finished = new Date();
    const job_id = jobId.replace("-first", "");

    // Look up last result
    const last = await knex("jobs").where({job_id}).first().select("last_result");
    if (!last) {
        console.log(`Missing entry for ${job_id}.  Re-syncing...`);
        await sync();
        return;
    }
    const lastResult = last.last_result;
    const thisResult = data;
    const changed = !lastResult || lastResult !== thisResult;
    let diff;

    if (changed) {
        console.log(`Detected change for ${job_id}!`);
        diff = makeDiff(lastResult, thisResult);
        await knex("jobs").where({job_id}).update({last_result: thisResult, last_change: finished});
    }

    const obj = {
        data: changed ? thisResult : null,
        error,
        job_id,
        count,
        started,
        finished,
        diff,
    };

    await knex("results")
        .insert(obj)
        .catch(e => {
            console.error(e);
        });

    return;
}

function makeDiff(a, b) {
    try {
        const a1 = JSON.parse(a);
        const b1 = JSON.parse(b);
        return jsonDiff.diffString(a1, b1);
    } catch (e) {
        console.error("Couldn't diff: " + e);
    }
}

async function getJob(job_id) {
    if (job_id) {
        return await knex("jobs").where({job_id}).select().first();
    } else {
        return await knex("jobs").select().limit(1000);
    }
}

async function getResults(job_id) {
    let obj;
    if (job_id) {
        obj = await knex("results").where({job_id}).select().limit(1000).orderBy("finished", "desc");
    } else {
        obj = await knex("results").select();
    }
    return obj.map(d => {
        return {
            ...d,
            data: JSON.parse(d.data),
        };
    });
}

async function getResult(result_id) {
    return await knex("results").where({id: result_id}).select().first();
}

module.exports = {
    getJob,
    addJob,
    editJob,
    deleteJob,
    writeResult,
    getResults,
    getResult,
    sync,
};
