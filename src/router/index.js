import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import ShipmentDataView from '../views/ShipmentDataView.vue'; // Ensure this filename matches exactly

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL), // Typo: histroy -> history
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/shipment/:id',
            name: 'shipment-detail',
            component: ShipmentDataView,
            props: true
        }
    ]
})

export default router;