import { createRouter, createWebHistory } from 'vue-router';
import User from './views/User.vue';
import Manager from './views/Manager.vue';
import Merchant from './views/Merchant.vue';
import Order from './views/Order.vue';
import Home from './views/Home.vue';

const router = createRouter({
    routes: [
        { path: '/', component: Home, },
        { path: '/user', component: User, },
        { path: '/manager', component: Manager, },
        { path: '/merchant/:id', component: Merchant, },
        { path: '/order/:merchant_id/:order_id', component: Order, },
    ],
    history: createWebHistory(),
})

export default router