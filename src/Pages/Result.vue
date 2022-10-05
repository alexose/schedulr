<script>
    import AnsiToHtml from "ansi-to-html";
    export default {
        name: "ResultPage",
        methods: {
            convert(str) {
                const converter = new AnsiToHtml({newline: true, fg: "#000", bg: "#FFF"});
                return converter.toHtml(str);
            },
        },
        data() {
            return {
                result: {},
                diff: "",
                id: this.$route.params.id,
                result_id: this.$route.params.result,
            };
        },
        async mounted() {
            const response = await fetch(`/api/results/${this.result_id}`);
            const obj = await response.json();
            this.result = obj;
            this.diff = this.convert(obj.diff);
        },
    };
</script>

<template>
    <RouterLink to="/">« Back to Results</RouterLink>
    <div v-html="diff" />
</template>
