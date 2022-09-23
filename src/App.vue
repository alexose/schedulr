<script>
    import {VAceEditor} from "vue3-ace-editor";

    export default {
        name: "App",
        components: {
            VAceEditor,
        },
        methods: {
            async addJob() {
                const obj = {
                    code: this.content,
                };
                if (this.repeat) {
                    obj.repeat = this.repeat;
                }
                const response = await fetch("/jobs", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(obj),
                });

                const text = await response.text();
                console.log(text);
            },
        },
        data() {
            return {
                content: "",
                repeat: "*/5 * * * *",
            };
        },
        async mounted() {
            const response = await fetch("/jobs");
            const text = await response.text();
            console.log(text);
        },
    };
</script>

<template>
    <div>
        <h1>Schedulr</h1>
    </div>
    <div class="job-form">
        <label>New Job</label>
        <div class="job-form-option editor">
            <VAceEditor v-model:value="content" lang="html" theme="chrome" style="height: 300px" />
        </div>
        <div class="job-form-option"><label>Repeat</label><input type="text" v-model="repeat" name="repeat" /></div>
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
