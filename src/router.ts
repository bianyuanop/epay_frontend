import { createRouter, createMemoryHistory, createWebHistory } from 'vue-router';
import User from './views/User.vue';
import Manager from './views/Manager.vue';
import Merchant from './views/Merchant.vue';

const router = createRouter({
    routes: [
        { path: '/user', component: User, },
        { path: '/manager', component: Manager, },
        { path: '/merchant/:id', component: Merchant, },
    ],
    history: createWebHistory(),
})

export default router