import {createRouter, createWebHistory} from 'vue-router';
import HomeView from '../views/HomeView.vue';
import ShipmentDetailView from '../views/ShipmentDetailView.vue'; // must create this soon

const router = createRouter({
    histroy: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
         path: '/',
         name: 'home',
         component: HomeView 
        },
        {
         path: '/shipment/:id', // shows details of a shipment
         name: 'shipment-detail',
         component: ShipmentDetailView,
         props: true // allows passing route params as props to the component
        }
    ]
})

export default router;