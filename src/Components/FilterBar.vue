<script>
    export default {
        name: "FilterBar",
        props: {
            show: {
                type: Boolean,
                default: true,
            },
        },
        methods: {
            updateFilters() {
                this.$emit("updateFilters", this.filters);
            },
        },
        data() {
            return {
                filters: {
                    changes: false,
                },
            };
        },
    };
</script>
<template>
    <div class="filters">
        <div class="filters-internal">
            <div class="filter-item">
                <input type="checkbox" id="changes" v-model="filters.changes" @change="updateFilters" />
                <label for="changes">Show Changes Only</label>
            </div>
        </div>
    </div>
</template>

<style>
    .filters {
        border: 1px solid #eee;
        margin-left: -10px;
        padding: 10px;
        width: 100%;
    }
    .filters-internal {
        width: 1200px;
        margin: 0 auto;
        display: flex;
    }
</style>
