<script>
    export default {
        name: "SimpleSpinner",
        props: {
            show: {
                type: Boolean,
                default: true,
            },
        },
    };
</script>
<template>
    <div class="spinner">
        <div class="spinner-arc" v-if="show"></div>
    </div>
</template>

<style>
    .spinner {
        display: inline-block;
        line-height: 100%;
        width: 1rem;
    }
    .spinner .spinner-arc {
        border: 4px solid #ddd;
        height: 12px;
        width: 12px;

        border-radius: 50%;
        border-bottom-color: transparent;
        border-right-color: transparent;
        animation: spin-spinner 0.8s steps(20) infinite;
    }
    @keyframes spin-spinner {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
</style>
