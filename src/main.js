import {createApp} from "vue";
import {createRouter, createWebHistory} from "vue-router";
import App from "./App.vue";
import Home from "./Pages/Home.vue";
import About from "./Pages/About.vue";

const routes = [
    {path: "/", component: Home},
    {path: "/about", component: About},
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

createApp(App).use(router).mount("#app");
