<script>
    import {VAceEditor} from "vue3-ace-editor";
    import {RouterView} from "vue-router";

    export default {
        name: "App",
        components: {
            VAceEditor,
            RouterView,
        },
        methods: {
            async addJob() {
                const obj = {
                    code: this.content,
                };
                if (this.every) {
                    obj.every = this.every;
                }
                const response = await fetch("/api/jobs", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(obj),
                });

                const text = await response.text();
                console.log(text);
            },
            async deleteJob(key) {
                await fetch("/api/jobs/" + key, {
                    method: "DELETE",
                });
            },
        },
        data() {
            return {
                content: "",
                every: "5",
                jobs: [],
                results: [],
            };
        },
        async mounted() {
            const jobsResponse = await fetch("/api/jobs");
            this.jobs = await jobsResponse.json();

            const resultsResponse = await fetch("/api/results");
            this.results = await resultsResponse.json();

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
    <RouterView></RouterView>
    <div class="job-list">
        <ul>
            <li v-for="job in jobs" :key="job.id">
                {{ job.id }} <button class="job-list-delete" @click="deleteJob(job.key)">X</button>
            </li>
        </ul>
    </div>
    <div class="result-list">
        <ul>
            <li v-for="result in results" :key="result.id">
                {{ result.data }} <button class="result-list-delete" @click="deleteResult(result.id)">X</button>
            </li>
        </ul>
    </div>
    <div class="job-form">
        <label>New Job</label>
        <div class="job-form-option editor">
            <VAceEditor v-model:value="content" lang="html" theme="chrome" style="height: 300px" />
        </div>
        <div class="job-form-option"><label>Repeat</label><input type="text" v-model="every" name="every" /></div>
        <button type="submit" @click="addJob">Add Job</button>
    </div>
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
    .job-form {
        max-width: 1020px;
        margin: 0 auto;
        border: 1px solid #ddd;
    }
    .job-form label {
        margin: 10px;
        display: inline-block;
    }
    .job-form-option.editor {
        border: 1px solid #ddd;
        max-width: 600px;
        margin: 0 auto;
    }
    .job-form-option {
        margin: 5px 0;
    }
</style>
