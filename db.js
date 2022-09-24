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
            t.json("data");
            t.string("job_id");
            t.datetime("started");
            t.datetime("finished");
        });
    }
});

module.exports = {
    writeResult(job_id, started, data) {
        knex("results").insert({
            data,
            job_id,
            started,
            finished: new Date(),
        });
        console.log("inserted results");
    },
    async getResults(job_id) {
        return await knex("results").where({job_id}).select();
    },
};
