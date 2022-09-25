<script>
    export default {
        name: "JobPage",
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
        },
        data() {
            return {
                results: [],
                changes: [],
                id: this.$route.params.id,
            };
        },
        async mounted() {
            const jobsResponse = await fetch(`/api/jobs/${this.id}`);
            this.results = await jobsResponse.json();
            this.calculateChanges();
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
            <th>Run Time</th>
        </thead>
        <tbody>
            <tr v-for="(result, idx) in results" :key="result.id">
                <td>{{ new Date(result.finished).toLocaleDateString() }}</td>
                <td>{{ new Date(result.finished).toLocaleTimeString() }}</td>
                <td>{{ result.data }}</td>
                <td>{{ changes[idx] }}</td>
                <td>{{ Math.round(((result.finished - result.started) / 1000) * 100) / 100 }}s</td>
            </tr>
        </tbody>
    </table>
</template>

<style>
    .results-table {
        width: 1200px;
        margin: 0 auto;
        border-spacing: 0;
    }
    .results-table tr:nth-child(odd) {
        background: #eaeaea;
    }
    .results-table td,
    .results-table th {
        padding: 5px;
    }
    .results-table-date,
    .results-table-time {
        width: 120px;
    }
</style>
