<script>
    import {RouterView} from "vue-router";
    export default {
        name: "App",
        components: {
            RouterView,
        },
        methods: {
            async handleEvent(event, data) {
                console.log("EVENT: " + event);
                if (event === "jobs_list") {
                    this.jobs = data;
                } else if (event === "job_start") {
                    const jobId = data;
                    const job = this.jobs.find(d => d.id === jobId);
                    if (job) job.status = "running";
                } else if (event === "job_failed") {
                    const jobId = data;
                    const job = this.jobs.find(d => d.id === jobId);
                    if (job) job.status = "failed";
                } else if (event === "job_completed") {
                    const jobId = data;
                    const job = this.jobs.find(d => d.id === jobId);
                    if (job) job.status = undefined;
                } else {
                    // Emit to client-side pubsub
                    this.emitter.emit(event, data);
                }
            },
            async refresh() {
                const jobsResponse = await fetch("/api/jobs");
                this.jobs = await jobsResponse.json();
                console.log("refreshed", this.jobs);
            },
        },
        data() {
            return {
                jobs: [],
            };
        },
        async mounted() {
            await this.refresh();
            this.emitter.on("job_added", this.refresh);
            this.emitter.on("job_changed", this.refresh);
            this.emitter.on("job_deleted", this.refresh);
            this.emitter.on("*", (type, e) => console.log(type, e));

            const ws = new WebSocket("ws://localhost:8081/api");
            ws.onmessage = e => {
                let obj;
                try {
                    obj = JSON.parse(e.data);
                    const {event, data} = obj;
                    this.handleEvent(event, data);
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
