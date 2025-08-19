import { createRouter, createWebHistory } from 'vue-router'
import DeelnemerPage from '../views/ParticipantPage.vue'
import Admin from '../views/Admin.vue'
import NotFound from '../views/NotFound.vue'

const routes = [
  {
    path: '/',
    name: 'DeelnemerPage',
    component: DeelnemerPage
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin
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