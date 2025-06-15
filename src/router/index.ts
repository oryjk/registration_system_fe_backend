import { createRouter, createWebHistory } from "vue-router";

const routes = [
  // {
  //   path: '/login',
  //   name: 'Login',
  //   component: () => import('../views/Login.vue')
  // },
  // {
  //   path: '/wx-callback',
  //   name: 'WxCallback',
  //   component: () => import('../views/WxCallback.vue')
  // },
  {
    path: "/",
    component: () => import("../layouts/MainLayout.vue"),
    children: [
      {
        path: "/create-competition",
        name: "CreateCompetition",
        component: () => import("../views/CreateCompetition.vue"),
      },
      {
        path: "/history-competition",
        name: "HistoryCompetition",
        component: () => import("../views/HistoryCompetition.vue"),
      },
      {
        path: "/settings",
        name: "Settings",
        component: () => import("../views/SystemSettings.vue"),
      },
      {
        path: "/user-info",
        name: "UserInfo",
        component: () => import("../views/UserInfo.vue"),
      },
      {
        path: "/user-billing",
        name: "UserBilling",
        component: () => import("../views/UserBilling.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
// router.beforeEach((to, from, next) => {
//   const userInfo = localStorage.getItem('userInfo')
//   if (to.path !== '/login' && !userInfo) {
//     next('/login')
//   } else {
//     next()
//   }
// })

export default router;
