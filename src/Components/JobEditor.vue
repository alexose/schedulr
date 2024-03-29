<script>
    import {VAceEditor} from "vue3-ace-editor";
    import SimpleSpinner from "./SimpleSpinner.vue";
    import examples from "../example-code.js";

    export default {
        name: "App",
        components: {
            VAceEditor,
            SimpleSpinner,
        },
        props: {
            job: Object,
        },
        computed: {
            isCustom() {
                return false;
                // return this.content && !examples.map(d => d.content).includes(this.content);
            },
        },
        methods: {
            async saveJob() {
                const id = this.name || this.placeholder;
                const name = id;
                const obj = {
                    code: this.content,
                    name,
                };
                if (this.every) {
                    obj.every = this.every;
                }
                if (this.notification) {
                    obj.notification = this.notification;
                }

                this.testLoading = true;
                await fetch("/api/jobs", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(obj),
                });

                // reload jobs
                this.emitter.emit("job_added");
                this.jobForm = false;
            },
            async testJob() {
                const id = this.name || this.placeholder;
                const name = id + "-" + +new Date();
                const obj = {
                    code: this.content,
                    name,
                };
                if (this.every) {
                    obj.every = this.every;
                }

                this.testLoading = true;
                const response = await fetch("/api/testjob", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(obj),
                });
                this.testResult = await response.json();
                this.testLoading = false;
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
            loadExample(event) {
                const idx = event.target.value;
                this.content = examples[idx].content;
            },
        },
        data() {
            const {job} = this;
            const obj = {
                name: "",
                placeholder: "Job-" + this.makeRandomHash(),
                content: examples[0].content,
                every: "5",
                notification: false,
                jobForm: false,
                testLoading: false,
                testResult: "",
                submitText: this.job ? "Save Job" : "Add Job",
                selected: 0,
                examples,
            };
            if (job) {
                obj.name = job.job_id;
                obj.content = job.code;
                obj.every = job.every;
                obj.jobForm = true;
            }
            return obj;
        },
        watch: {
            name: function (after, before) {
                if (after !== before) this.tested = false;
            },
            content: function (after, before) {
                if (after !== before) this.tested = false;
            },
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
            <label></label>
            <select @change="loadExample" v-model="selected" :disabled="isCustom">
                <option :value="idx" v-for="(example, idx) in examples" :key="idx">{{ example.name }}</option>
            </select>
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
            <details>
                <summary>Advanced Options</summary>
                <div class="job-form-option job-form-option-advanced">
                    <input type="checkbox" id="diffs" name="diffs" />
                    <label class="pointer" for="diffs">Store full results regardless of changes</label>
                </div>
                <div class="job-form-option job-form-option-advanced">
                    <input type="checkbox" id="notification" name="notification" />
                    <label class="pointer" for="notification">Notify me on change</label>
                </div>
                <div class="job-form-option job-form-option-advanced">
                    <input class="job-form-input-small" type="text" id="timeout" name="timeout" placeholder="5" />
                    <label for="timeout">second timeout</label>
                </div>
            </details>
        </div>
        <div class="job-form-option centered">
            <label></label>
            <div v-if="tested">tested</div>
            <button type="submit" @click="saveJob">{{ submitText }}</button>
            <button type="submit" @click="testJob(false)">Test Job</button>
            <div class="status" :class="{hidden: !testLoading}">
                <SimpleSpinner />
            </div>
            <button @click="this.jobForm = false" class="secondary">Cancel</button>
            <div class="spacer" />
        </div>
        <div class="job-form-option" v-if="!testLoading && testResult">
            <label>Test result:</label>
            <div class="test-result">
                {{ testResult }}
            </div>
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
        margin: 24px 0;
        display: flex;
    }
    .job-form-option summary {
        cursor: pointer;
    }
    .job-form-option.centered {
        align-items: center;
    }
    .job-form-option .editor {
        border: 1px solid #ddd;
        width: 630px;
    }
    .job-form-option .test-result {
        margin-top: 5px;
    }
    .job-form-option input {
        padding: 0 10px;
        font-size: 16px;
    }
    .job-form-option select {
        padding: 10px;
    }
    .job-form-option button {
        padding: 6px 10px;
        margin-right: 20px;
    }
    .job-form-option button.secondary {
        border: none;
        margin-left: 20px;
    }
    .job-form-input-small {
        width: 30px;
        text-align: center;
    }
    .job-form label.job-form-label-extra {
        width: auto;
    }
    .job-form-option .hidden {
        visibility: hidden;
    }
    .job-form-option-advanced {
        margin: 10px 0;
    }
    .job-form-option-advanced label {
        width: auto;
    }
    .job-form-option .pointer {
        cursor: pointer;
    }
</style>
