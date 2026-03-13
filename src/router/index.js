import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', redirect: '/prijava' },
  {
    path: '/prijava',
    name: 'Auth',
    component: () => import('../views/auth.vue'),
    meta: { gostu: true },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/dashboard.vue'),
    meta: { zastiteno: true },
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/adminpanel.vue'),
    meta: { zastiteno: true, samoAdmin: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export function postaviGuard(authStore) {
  router.beforeEach((to, from, next) => {
    if (to.meta.zastiteno && !authStore.jePrijavljen) {
      return next('/prijava');
    }
    if (to.meta.gostu && authStore.jePrijavljen) {
      return next(authStore.jeAdmin ? '/admin' : '/dashboard');
    }
    if (to.meta.samoAdmin && !authStore.jeAdmin) {
      return next('/dashboard');
    }
    next();
  });
}

export default router;