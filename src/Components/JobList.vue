<script>
    import {RouterLink} from "vue-router";

    import SimpleSpinner from "./SimpleSpinner.vue";
    export default {
        name: "JobList",
        components: {
            RouterLink,
            SimpleSpinner,
        },
        props: {
            jobs: Array,
        },
        methods: {
            async deleteJob(job_id) {
                await fetch("/api/jobs/" + job_id, {
                    method: "DELETE",
                });
                this.emitter.emit("job_deleted", job_id);
            },
        },
    };
</script>

<template>
    <table v-if="jobs.length" class="job-list">
        <thead>
            <tr>
                <th>Name</th>
                <th>Run Count</th>
                <th>Last Run</th>
                <th>Last Result</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="job in jobs" :key="job.job_id">
                <td>
                    <RouterLink :to="'/jobs/' + job.job_id">{{ job.job_id }}</RouterLink>
                </td>
                <td>{{ job.run_count }}</td>
                <td>{{ new Date(job.last_run).toLocaleString() }}</td>
                <td class="job-list-lastresult">{{ job.last_result }}</td>
                <td class="job-list-controls">
                    <button class="job-list-delete" @click="deleteJob(job.job_id)">X</button>
                    <div class="status" :class="{hidden: !job.status}">
                        <div class="status" v-if="job.status === 'running'">
                            <SimpleSpinner />
                        </div>
                        <div class="error" v-if="job.status === 'failed'">!</div>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<style>
    .job-list {
        width: 900px;
        margin: 50px auto;
        text-align: left;
        white-space: nowrap;
    }
    .job-list td,
    .job-list th {
        padding: 5px 10px;
    }
    .job-list-controls {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .job-list-controls .hidden {
        opacity: 0;
    }
    .job-list-lastresult {
        overflow: hidden;
        max-width: 600px;
        text-overflow: ellipsis;
    }
    .status {
        width: 40px;
        display: flex;
        justify-content: center;
    }
    .error {
        font-weight: 800;
        color: red;
    }
</style>
