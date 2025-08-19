import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../components/main_page.vue'
import LoginPage from '../components/login.vue'
import CreateNewGroup from '../components/create_group.vue'

const routes = [
  { path: '/', component: HomePage },
  { path: '/login', component: LoginPage },
  { path: '/newGroup', component: CreateNewGroup },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
