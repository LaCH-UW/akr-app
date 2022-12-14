import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

require("./assets/reset.css");
require("./assets/style.css");

createApp(App).use(router).mount("#app");
