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
            t.datetime("started");
            t.datetime("finished");
        });
    }
});

module.exports = {
    async writeResult(job_id, started, data) {
        const result = knex("results")
            .insert({
                data: JSON.stringify(data),
                job_id,
                started,
                finished: new Date(),
            })
            .then(() => {
                console.log("inserted data");
            })
            .catch(e => {
                console.error(e);
            });
    },
    async getResults(job_id) {
        let obj;
        if (job_id) {
            obj = await knex("results").where({job_id}).select();
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
};
