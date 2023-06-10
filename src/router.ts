import { createRouter, createMemoryHistory } from 'vue-router';
import User from './views/User.vue';
import Manager from './views/Manager.vue';
import Merchant from './views/Merchant.vue';

const router = createRouter({
    routes: [
        { path: '/user', component: User, },
        { path: '/manager', component: Manager, },
        { path: '/merchant', component: Merchant, },
    ],
    history: createMemoryHistory(),
})

export default router