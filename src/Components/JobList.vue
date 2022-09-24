<script>
    export default {
        name: "JobList",
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
                <th>Run</th>
                <th>Last Run</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="job in jobs" :key="job.id">
                <td>{{ job.id }}</td>
                <td></td>
                <td></td>
                <td><button class="job-list-delete" @click="deleteJob(job.key)">X</button></td>
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
