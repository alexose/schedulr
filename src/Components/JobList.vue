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
            async deleteJob(key) {
                await fetch("/api/jobs/" + key, {
                    method: "DELETE",
                });
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
            <tr v-for="job in jobs" :key="job.id">
                <td>
                    <RouterLink :to="'/jobs/' + job.id">{{ job.id }}</RouterLink>
                </td>
                <td>{{ job.lastResult?.count }}</td>
                <td>{{ new Date(job.lastResult?.finished).toLocaleDateString() }}</td>
                <td>{{ job.lastResult?.data }}</td>
                <td>
                    <button class="job-list-delete" @click="deleteJob(job.key)">X</button><SimpleSpinner v-if="true" />
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
    }
    .job-list ul {
        list-style: none;
    }
    .job-list ul li {
    }
</style>
