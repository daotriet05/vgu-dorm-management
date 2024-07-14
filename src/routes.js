import { createRouter, createWebHashHistory } from "vue-router";
import Home from './components/Home.vue'
import SupportRequest from './components/SupportRequest.vue'
import EmergencyRequest from './components/EmergencyRequest.vue'
import Login from './components/Login.vue'

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        { path: '/Home', component: Home},
        { path: '/SupportRequest', component: SupportRequest},
        { path: '/EmergencyRequest', component: EmergencyRequest},
        { path: '/login', component: Login }
    ]
})

export default router