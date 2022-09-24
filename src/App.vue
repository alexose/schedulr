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

            const ws = new WebSocket("ws://localhost:8081/api");
            ws.onmessage = e => {
                let obj;
                try {
                    obj = JSON.parse(e.data);
                } catch (e) {
                    console.error("Couldn't parse data: " + e);
                }
                this.jobs = obj;
                console.log(obj);
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
