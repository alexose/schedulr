import {createApp} from "vue";
import {createRouter, createWebHistory} from "vue-router";
import App from "./App.vue";
import Home from "./Pages/Home.vue";
import About from "./Pages/About.vue";
import Job from "./Pages/Job.vue";
import Result from "./Pages/Result.vue";
import mitt from "mitt";

const emitter = mitt();

const routes = [
    {path: "/", component: Home},
    {path: "/about", component: About},
    {path: "/jobs/:id", component: Job},
    {path: "/jobs/:id/:result", component: Result},
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

const app = createApp(App);
app.config.globalProperties.emitter = emitter;
app.use(router).mount("#app");
