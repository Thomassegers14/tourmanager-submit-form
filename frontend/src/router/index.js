import { createRouter, createWebHistory } from 'vue-router'
import DeelnemerPage from '../views/ParticipantPage.vue'
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
    component: () => import('../views/Admin.vue')
  },
  {
    path: '/favorieten',
    name: 'favorieten',
    component: () => import('../views/Favorieten.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      // bij terugknop, behoud scrollpositie
      return savedPosition
    } else {
      // bij navigatie naar nieuwe tab: naar boven scrollen
      return { top: 0 }
    }
  }
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