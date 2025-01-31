import './index.css';
import { createApp } from 'vue'
import App from './renderer/App.vue';
import { router } from './renderer/router/router';

const app = createApp(App)
    .use(router)
    .mount('#app')