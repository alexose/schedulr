<script>
    import JobList from "../Components/JobList.vue";
    import JobEditor from "../Components/JobEditor.vue";
    export default {
        name: "HomePage",
        props: {
            jobs: Array,
        },
        components: {
            JobList,
            JobEditor,
        },
    };
</script>

<template>
    <JobList :jobs="jobs" />
    <JobEditor />
</template>
