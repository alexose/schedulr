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
            t.datetime("last_run");
        });
    }
});

// Create results table
knex.schema.hasTable("results").then(function (exists) {
    if (!exists) {
        return knex.schema.createTable("results", function (t) {
            t.increments("id").primary();
            t.string("data");
            t.string("job_id");
            t.integer("count");
            t.datetime("started");
            t.datetime("finished");
        });
    }
});

module.exports = {
    async writeResult(job_id, started, count, obj) {
        const data = JSON.stringify(obj);
        const finished = new Date();
        const result = knex("results")
            .insert({
                data,
                job_id,
                count,
                started,
                finished,
            })
            .then(() => {
                const trunc = data.length > 80 ? data.substr(0, 80) + "..." : data;
                const seconds = Math.round(((finished - started) / 1000) * 100) / 100;
                console.log(`${job_id}: Got ${trunc} in ${seconds} seconds.`);
            })
            .catch(e => {
                console.error(e);
            });
    },
    async getResults(job_id) {
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
    },
    async augmentResults(jobs) {
        // TODO: replace this with some cool INNER JOIN stuff
        for (let i = 0; i < jobs.length; i++) {
            jobs[i].lastResult = await knex("results").where({job_id: jobs[i].id}).orderBy("id", "desc").first();
        }
        return jobs;
    },
};
