import { createRouter, createWebHistory } from 'vue-router';
import Inicio from '../components/shared/Inicio.vue';


import TicketViewer from '../components/shared/TicketViewer.vue'; 


import AdminAccess from '../components/admin/AdminAccess.vue';
import ContadorAccess from '../components/contador/ContadorAccess.vue'; 


import AdminPanel from '../components/admin/AdminPanel.vue';
import ContadorPanel from '../components/contador/ContadorPanel.vue';


import AdminDashboard from '../components/admin/AdminDashboard.vue'; 
import ContadorDashboard from '../components/contador/ContadorDashboard.vue'; 


const routes = [
    { path: '/', name: 'Home', component: Inicio },
    
    
    { path: '/admin-access', name: 'AdminAccess', component: AdminAccess },
    { path: '/contador-access', name: 'ContadorAccess', component: ContadorAccess },

   
    { 
        path: '/ticket-viewer', 
        name: 'TicketViewer', 
        component: TicketViewer 
    },

    
    { path: '/admin', component: AdminPanel, meta: { requiresAuth: true, role: 2 }, children: [
        { path: '', name: 'AdminDashboard', component: AdminDashboard,}, 
    ]},

    
    {
        path: '/contador',
        component: ContadorPanel,
        meta: { requiresAuth: true, role: 4 },
        children: [ 
            {path: '', name: 'ContadorDashboard', component: ContadorDashboard,},
        ]
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});


router.beforeEach((to, from, next) => {
    const isLoggedIn = !!localStorage.getItem('userToken');
    let userRole = null;
    
    try {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        userRole = userData.id_rol; 
    } catch (e) {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
    }

    const requiresAuth = to.meta.requiresAuth;
    const requiredRole = to.meta.role;
    
    
    if (to.name === 'AdminAccess' && isLoggedIn && userRole === 2) {
        return next('/admin');
    }
    if (to.name === 'ContadorAccess' && isLoggedIn && userRole === 4) {
        return next('/contador');
    }

    
    if (requiresAuth) {
        if (!isLoggedIn) {
            
            if (to.path.startsWith('/admin')) {
                return next('/admin-access'); 
            } else if (to.path.startsWith('/contador')) {
                return next('/contador-access');
            }
            return next('/'); 
        } 
        
         
        if (requiredRole && userRole !== requiredRole) {
            
            return next('/'); 
        }
    }
    next();
});

export default router;