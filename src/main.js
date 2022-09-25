import {createApp} from "vue";
import {createRouter, createWebHistory} from "vue-router";
import App from "./App.vue";
import Home from "./Pages/Home.vue";
import About from "./Pages/About.vue";
import Job from "./Pages/Job.vue";

const routes = [
    {path: "/", component: Home},
    {path: "/about", component: About},
    {path: "/jobs/:id", component: Job},
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

createApp(App).use(router).mount("#app");
