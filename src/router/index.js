import { createRouter, createWebHistory } from 'vue-router'
import WaitingPage from '../components/WaitingPage.vue'
import ResetPassword from '../components/ResetPassword.vue'
import Privacy from '../components/legal/Privacy.vue'
import Terms from '../components/legal/Terms.vue'
import Support from '../components/legal/Support.vue'
import { usePostHog } from '@/composables/usePostHog.js'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: WaitingPage
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPassword
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: Privacy
  },
  {
    path: '/terms',
    name: 'Terms',
    component: Terms
  },
  {
    path: '/support',
    name: 'Support',
    component: Support
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Initialize PostHog and track pageviews
const { posthog } = usePostHog()

router.afterEach((to) => {
  posthog.capture('$pageview', { page: to.path })
})

export default router

