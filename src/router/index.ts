import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      {
        path: '/create-competition',
        name: 'CreateCompetition',
        component: () => import('../views/CreateCompetition.vue')
      },
      {
        path: '/history-competition',
        name: 'HistoryCompetition',
        component: () => import('../views/HistoryCompetition.vue')
      },
      {
        path: '/settings',
        name: 'Settings',
        component: () => import('../views/SystemSettings.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
