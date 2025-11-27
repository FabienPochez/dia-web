import { createRouter, createWebHistory } from 'vue-router'
import WaitingPage from '../components/WaitingPage.vue'
import ResetPassword from '../components/ResetPassword.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

