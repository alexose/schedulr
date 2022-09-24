<script>
    import {VAceEditor} from "vue3-ace-editor";
    import ExampleCode from "../example-code.js";

    export default {
        name: "App",
        components: {
            VAceEditor,
        },
        methods: {
            async addJob() {
                const obj = {
                    code: this.content,
                    name: this.name || this.placeholder,
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
                this.jobForm = false;
            },
            makeRandomHash() {
                // via https://stackoverflow.com/questions/1349404
                let result = "";
                const length = 5;
                const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                const charactersLength = characters.length;
                for (var i = 0; i < length; i++) {
                    result += characters.charAt(Math.floor(Math.random() * charactersLength));
                }
                return result;
            },
        },
        data() {
            return {
                name: "",
                placeholder: "Job-" + this.makeRandomHash(),
                content: ExampleCode,
                every: "5",
                jobForm: false,
            };
        },
    };
</script>

<template>
    <div>
        <button v-if="!jobForm" @click="this.jobForm = true">+ Add a new job</button>
    </div>
    <div v-if="jobForm" class="job-form">
        <div class="job-form-option">
            <label>Name</label><input type="text" :placeholder="placeholder" v-model="name" name="name" />
        </div>
        <div class="job-form-option">
            <label>Code</label>
            <div class="editor">
                <VAceEditor v-model:value="content" lang="html" theme="chrome" style="height: 300px" />
            </div>
        </div>
        <div class="job-form-option">
            <label>Run every</label>
            <input type="text" class="job-form-input-small" maxlength="4" v-model="every" name="every" />
            <label class="job-form-label-extra">minutes</label>
        </div>
        <div class="job-form-option">
            <label></label>
            <button type="submit" @click="addJob">Add Job</button>
            <button @click="this.jobForm = false" class="secondary">Cancel</button>
        </div>
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
        max-width: 800px;
        margin: 0 auto;
        text-align: left;
    }
    .job-form label {
        margin: 5px 10px;
        display: inline-block;
        width: 100px;
        text-align: right;
    }
    .job-form-option {
        margin: 15px 0;
        display: flex;
    }
    .job-form-option .editor {
        border: 1px solid #ddd;
        width: 630px;
    }
    .job-form-option input {
        padding: 0 10px;
        font-size: 16px;
    }
    .job-form-option button {
        padding: 6px 10px;
        margin-right: 20px;
    }
    .job-form-option button.secondary {
        border: none;
    }
    .job-form-input-small {
        width: 36px;
        text-align: center;
    }
    .job-form label.job-form-label-extra {
        width: auto;
    }
</style>
