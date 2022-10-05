const jobQueue = require("./jobQueue.js");

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
        console.log(`Adding ${name}, repeating every ${every} seconds...`);
        await jobQueue.add(data, {jobId: name, repeat: {every: every * 1000}});
        await writeJob(obj);
    } else {
        // One-off jobs don't get recorded, for now
        console.log(`Adding ${name} with no repeat...`);
        jobQueue.add(data, {jobId: name});
    }

    const jobs = await jobQueue.getRepeatableJobs();
    return jobs;
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

async function writeResult(job_id, started, count, data, error) {
    const finished = new Date();

    // Look up last result
    const last = await knex("jobs").where({job_id}).first().select("last_result");
    const lastResult = last.last_result;
    const thisResult = JSON.stringify(data);
    const changed = !lastResult || lastResult !== thisResult;

    if (changed) {
        console.log(`Detected change for ${job_id}!`);
        await knex("jobs").where({job_id}).update({last_result: thisResult, last_change: finished});
    }

    await knex("results")
        .insert({
            data: changed ? thisResult : null,
            error,
            job_id,
            count,
            started,
            finished,
        })
        .catch(e => {
            console.error(e);
        });
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

module.exports = {
    getJob,
    addJob,
    editJob,
    deleteJob,
    writeResult,
    getResults,
};
