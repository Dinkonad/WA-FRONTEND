import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './app.vue';
import router, { postaviGuard } from './router/index.js';
import { useAuthStore } from './stores/authStore.js';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

const auth = useAuthStore();
postaviGuard(auth);

app.mount('#app');