<script>
    import JobList from "../Components/JobList.vue";
    import NewJob from "../Components/NewJob.vue";
    export default {
        name: "HomePage",
        props: {
            jobs: Array,
        },
        components: {
            JobList,
            NewJob,
        },
    };
</script>

<template>
    <JobList :jobs="jobs" />
    <NewJob />
</template>
