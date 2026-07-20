import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', redirect: '/prijava' },
  {
    path: '/prijava',
    name: 'Auth',
    component: () => import('../views/auth.vue'),
  },
  {
    path: '/odabir-prijave',
    name: 'OdabirPrijave',
    component: () => import('../views/OdabirPrijave.vue'),
    meta: { zastiteno: true },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/dashboard.vue'),
    meta: { zastiteno: true },
  },
  {
    path: '/feed',
    name: 'FitnessFeed',
    component: () => import('../views/FitnessFeed.vue'),
    meta: { zastiteno: true },
  },
  {
    path: '/izazovi',
    name: 'Izazovi',
    component: () => import('../views/Izazovi.vue'),
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
    if (to.meta.samoAdmin && !authStore.jeAdmin) {
      return next('/odabir-prijave');
    }
    next();
  });
}

export default router;