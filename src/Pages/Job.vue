<script>
    import JobEditor from "../Components/JobEditor.vue";
    export default {
        name: "JobPage",
        components: {
            JobEditor,
        },
        methods: {
            calculateChanges() {
                // Are we dealing with single-number results? If so, we can figure out the changes between each run.
                const first = this.results[0];
                const value = parseFloat(first.data);
                if (!isNaN(value)) {
                    for (var i = 0; i < this.results.length - 1; i++) {
                        const a = parseFloat(this.results[0].data);
                        const b = parseFloat(this.results[1].data);
                        this.changes[i] = !isNaN(a) && !isNaN(b) ? a - b : "-";
                    }
                }
            },
            editJob() {
                this.editing = true;
            },
        },
        data() {
            return {
                results: [],
                job: {},
                id: this.$route.params.id,
                editing: false,
            };
        },
        async mounted() {
            const jobsResponse = await fetch(`/api/jobs/${this.id}`);
            const obj = await jobsResponse.json();
            this.results = obj.results;
            this.job = obj.job;
            console.log(obj);
        },
    };
</script>

<template>
    <RouterLink to="/">« Back to Jobs List</RouterLink>
    <div>
        <h2>Results for {{ id }}:</h2>
    </div>
    <table class="results-table">
        <thead>
            <th class="results-table-date">Date</th>
            <th class="results-table-time">Time</th>
            <th>Value</th>
            <th>Change</th>
            <th class="results-table-error">Error</th>
            <th class="results-table-runtime">Run Time</th>
        </thead>
        <tbody>
            <tr v-for="result in results" :key="result.id">
                <td>{{ new Date(result.finished).toLocaleDateString() }}</td>
                <td>{{ new Date(result.finished).toLocaleTimeString() }}</td>
                <td class="results-table-value">{{ result.data }}</td>
                <td class="results-table-diff">{{ result.diff }}</td>
                <td>
                    <div class="error-text">{{ result.error }}</div>
                </td>
                <td>{{ Math.round(((result.finished - result.started) / 1000) * 100) / 100 }}s</td>
            </tr>
        </tbody>
    </table>
    <hr class="spacer" />
    <button @click="editJob()">Edit Job</button>
    <div class="job-editor" v-if="editing">
        <JobEditor :job="job" />
    </div>
</template>

<style>
    .results-table {
        width: 1200px;
        margin: 0 auto;
        border-spacing: 0;
        white-space: nowrap;
    }
    .results-table tr:nth-child(odd) {
        background: #f3f3f3;
    }
    .results-table td,
    .results-table th {
        padding: 10px 10px;
    }
    .results-table-date,
    .results-table-time,
    .results-table-runtime {
        width: 120px;
    }

    .results-table-value {
        overflow: hidden;
        max-width: 500px;
        text-overflow: ellipsis;
    }

    .results-table-diff {
        overflow: hidden;
        max-width: 500px;
        text-overflow: ellipsis;
    }

    .error-text {
        max-width: 460px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
</style>
