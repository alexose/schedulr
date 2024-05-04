const jobQueue = require("./jobQueue.js");
const jsonDiff = require("json-diff");
const socket = require("./socket");
const broadcast = socket.broadcast;

var Push = require("pushover-notifications");

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
            t.boolean("notification");
            t.integer("run_count").notNullable().defaultTo(0);
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
    // Begin by running job and seeing if it errors
    const started = +new Date();
    const firstRun = await runJob(obj);

    if (firstRun.error) {
        return {error};
    }

    // If it didn't error out, we're ready to add the 'repeatable' job
    const {name, every, ...data} = obj;
    console.log(`Adding ${name}, repeating every ${every} minutes...`);
    await jobQueue.add(data, {jobId: name, repeat: {every: every * 1000 * 60}});

    // Record job in database
    await writeJob(obj);

    console.log(obj);

    // Record first result in database
    await writeResult(name, started, 1, firstRun.result, null);

    return firstRun.result;
}

// Run job immediately, record the results, and also return them
async function runJob(obj) {
    return new Promise(async (resolve, reject) => {
        const {name, every, notification, ...data} = obj;
        console.log(data, notification);

        const job = await jobQueue.add(data, {jobId: name});
        const result = await job.finished();
        resolve({result});
    });
}

// Sync database with queue.  Our strategy here is that the database is the source of truth.
// If we find a job that exists in the DB but not in the queue, we create it.
// Vise versa, we delete it.
async function sync() {
    // Don't sync if we haven't set up our tables yet
    const hasJobs = await knex.schema.hasTable("jobs");
    const hasResults = await knex.schema.hasTable("jobs");
    if (!hasJobs || !hasResults) return;

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

async function writeResult(jobId, started, count, data, error) {
    const finished = new Date();
    const job_id = jobId;
    let changed;
    let lastResult;
    let diff;
    const thisResult = data;

    // Look up last result, if applicable
    const last = await knex("jobs").where({job_id}).first().select("last_result");
    if (last && last.last_result) {
        const lastResult = JSON.parse(last.last_result);
        const changed = !lastResult || lastResult !== thisResult;

        if (changed) {
            console.log(`Detected change for ${job_id}!`);

            var p = new Push({
                user: "unsryrfdd4oppux5t1xy7dpo4ze2u4",
                token: "ae7jcwauw8it4pia7d3risz3xk75qc",
                onerror: function (error) {
                    console.log(error);
                },
                update_sounds: true, // update the list of sounds every day - will prevent app from exiting.
            });
            var msg = {
                message: `Detected change for ${job_id}!`, // required
                title: "Change detection",
                priority: 0,
            };
            p.send(msg, function (err, result) {
                if (err) {
                    throw err;
                }
                console.log(result);
            });

            diff = makeDiff(lastResult, thisResult);
            await knex("jobs").where({job_id}).update({last_change: finished});
        }
    }

    await knex("jobs")
        .where({job_id})
        .update({last_run: finished, last_result: JSON.stringify(data)});
    await knex("jobs").where({job_id}).increment("run_count");

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
        console.log(a, b);
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

async function getResults(job_id, filters) {
    let obj;
    if (job_id) {
        if (filters && filters.changes === true) {
            obj = await knex("results")
                .where({job_id})
                .whereNotNull("diff")
                .select()
                .limit(1000)
                .orderBy("finished", "desc");
        } else {
            obj = await knex("results").where({job_id}).select().limit(1000).orderBy("finished", "desc");
        }
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
