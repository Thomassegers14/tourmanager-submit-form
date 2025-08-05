import { createRouter, createWebHistory } from 'vue-router'
import DeelnemerPage from '../views/DeelnemerPage.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import AdminLogin from '../views/AdminLogin.vue'
import NotFound from '../views/NotFound.vue'

const routes = [
  {
    path: '/',
    name: 'DeelnemerPage',
    component: DeelnemerPage
  },
  {
    path: '/admin-login',
    name: 'AdminLogin',
    component: AdminLogin
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Route guard
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const isAdmin = localStorage.getItem('isAdmin') === 'true'
    if (isAdmin) {
      next()
    } else {
      next('/admin-login')
    }
  } else {
    next()
  }
})

export default router