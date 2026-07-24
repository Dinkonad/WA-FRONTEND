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
    path: '/clanarina',
    name: 'Clanarina',
    component: () => import('../views/Clanarina.vue'),
    meta: { zastiteno: true },
  },
  {
    path: '/qr-kod',
    name: 'QrKod',
    component: () => import('../views/QrKod.vue'),
    meta: { zastiteno: true },
  },
  {
    path: '/profil',
    name: 'Profil',
    component: () => import('../views/Profil.vue'),
    meta: { zastiteno: true },
  },
  {
    path: '/povijest-clanarina',
    name: 'PovijestClanarina',
    component: () => import('../views/PovijestClanarina.vue'),
    meta: { zastiteno: true },
  },
  {
    path: '/moji-rekordi',
    name: 'MojiRekordi',
    component: () => import('../views/MojiRekordi.vue'),
    meta: { zastiteno: true },
  },
  {
    path: '/feedback',
    name: 'Feedback',
    component: () => import('../views/Feedback.vue'),
    meta: { zastiteno: true },
  },
  {
    path: '/recepcija',
    name: 'Recepcija',
    component: () => import('../views/Recepcija.vue'),
    meta: { zastiteno: true, samoRecepcija: true },
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/adminpanel.vue'),
    meta: { zastiteno: true, samoAdmin: true },
  },
  {
    path: '/knjigovodstvo',
    name: 'Knjigovodstvo',
    component: () => import('../views/Knjigovodstvo.vue'),
    meta: { zastiteno: true, samoKnjigovodstvo: true },
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
    if (to.meta.samoKnjigovodstvo && !authStore.jeKnjigovodstvo) {
      return next('/odabir-prijave');
    }
    if (to.meta.samoRecepcija && !authStore.jeRecepcija) {
      return next('/odabir-prijave');
    }
    next();
  });
}

export default router;