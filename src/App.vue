<script>
    import {RouterView} from "vue-router";

    export default {
        name: "App",
        components: {
            RouterView,
        },
        data() {
            return {
                jobs: [],
            };
        },
        async mounted() {
            const jobsResponse = await fetch("/api/jobs");
            this.jobs = await jobsResponse.json();
            console.log(this.jobs);

            const ws = new WebSocket("ws://localhost:8081/api");
            ws.onmessage = e => {
                let obj;
                try {
                    obj = JSON.parse(e.data);
                    const event = obj.event;
                    if (event === "job_list") {
                        this.jobs = obj.data;
                    } else if (event === "job_start") {
                        const jobId = obj.data;
                        const job = this.jobs.find(d => d.id === jobId);
                        if (job) job.status = "running";
                    } else if (event === "job_failed") {
                        const jobId = obj.data;
                        const job = this.jobs.find(d => d.id === jobId);
                        if (job) job.status = "failed";
                    } else if (event === "job_completed") {
                        const jobId = obj.data;
                        const job = this.jobs.find(d => d.id === jobId);
                        if (job) job.status = undefined;
                    } else if (event === "test_failed") {
                        console.log("TESTFAILED", obj);
                    } else if (event === "test_completed") {
                        console.log("TESTSUCCEDED", obj);
                    }
                } catch (e) {
                    console.error("Couldn't parse data: " + e);
                }
            };
        },
    };
</script>

<template>
    <div>
        <h1>Schedulr</h1>
    </div>
    <RouterView :jobs="jobs"></RouterView>
</template>

<style>
    #app {
        font-family: Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }
</style>
