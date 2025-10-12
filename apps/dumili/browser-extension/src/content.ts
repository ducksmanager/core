import { createApp } from "vue";
import DumiliHelper from "./components/DumiliHelper.vue";

const container = document.createElement("div");
container.id = "dumili-helper-app";
document.body.appendChild(container);

createApp(DumiliHelper)
    .mount("#dumili-helper-app");
