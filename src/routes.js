import { createRouter, createWebHashHistory } from "vue-router";
import Home from './components/Home.vue'

import Feed from './components/Feed.vue'
import FeedUser from './components/FeedUser.vue'
import FeedAdmin from './components/FeedAdmin.vue'

import SupportRequest from './components/SupportRequest.vue'
import SupportRequestUser from './components/SupportRequestUser.vue'
import SupportRequestAdmin from './components/SupportRequestAdmin.vue'

import EmergencyRequest from './components/EmergencyRequest.vue'
import EmergencyRequestUser from './components/EmergencyRequestUser.vue'
import EmergencyRequestAdmin from './components/EmergencyRequestAdmin.vue'

import Login from './components/Login.vue'

import { getAuth, onAuthStateChanged } from "firebase/auth";

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        { path: '/', component: Home},
        { 
            path: '/Feed', 
            component: Feed,
            children: [
                { path: 'User', component: FeedUser},
                { path: 'Admin', component: FeedAdmin}
            ],
            meta:{
                requiresAuth: true
            }
        },
        { 
            path: '/SupportRequest', 
            component: SupportRequest,
            children: [
                { path: 'User', component: SupportRequestUser},
                { path: 'Admin', component: SupportRequestAdmin}
            ],
            meta:{
                requiresAuth: true
            }
        },
        { 
            path: '/EmergencyRequest', 
            component: EmergencyRequest,
            children: [
                { path: 'User', component: EmergencyRequestUser},
                { path: 'Admin', component: EmergencyRequestAdmin}
            ],
            meta:{
                requiresAuth: true
            }
        },
        { path: '/Login', component: Login }
    ]
})

const getCurrentUser = () => {
    return new Promise((resolve, reject) => {
        const removeListener = onAuthStateChanged(
            getAuth(),
            (user) => {
                removeListener();
                resolve(user);
            },
            reject
        );
    });
};

router.beforeEach(async (to, from, next) => {
    if (to.matched.some((record) => record.meta.requiresAuth)) {
        if (await getCurrentUser()) {
            next();
        } else {
            alert("you dont have access!");
            next("/");
        }
    } else {
        next();
    }
});

export default router