import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/chat',
    },
    {
      path: '/chat',
      component: () => import('../views/ChatComponent.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/auth',
      component: () => import('../views/AuthenticationComponent.vue'),
    },
  ],
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      next('/auth')
      return
    }

    const isValidToken = await authStore.validateToken()
    if (!isValidToken) {
      return
    }

    next()
  } else if (to.path === '/auth' && authStore.isAuthenticated) {
    const isValidToken = await authStore.validateToken()
    if (isValidToken) {
      next('/chat')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
