import { createApp } from 'vue';
import DumiliHelper from './components/DumiliHelper.vue';

const container = document.createElement('div');
container.id = 'dumili-helper-app';
document.body.appendChild(container);

const app = createApp(DumiliHelper);
app.mount('#dumili-helper-app');
