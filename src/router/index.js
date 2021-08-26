import Vue from 'vue';
import Router from 'vue-router';
import Init from '@/components/Init';
import Checkin from '@/components/Checkin';
import Login from '@/components/Login';
import ChooseRooms from '@/components/ChooseRooms';

import store from '@/store';

Vue.use(Router);

let router = new Router({
  routes: [
    {
      path: '/',
      name: 'Init',
      component: Init,
      meta: {
        requireAuth: false,
      },
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: {
        requireAuth: false,
      },
    },
    {
      path: '/choose-rooms',
      name: 'ChooseRooms',
      component: ChooseRooms,
    },
    {
      path: '/checkin',
      name: 'Checkin',
      component: Checkin,
    },
  ],
});


router.beforeEach((to, from, next) => {

  // If route is Init, proceed
  if (to.name === 'Init') next();

  // If state not ready, redirect to Init
  if (!store.state.ready) {
    if (!store.getters.requestedRoute) {
      store.commit('setRequestedRoute', to);
    }
    return next({ name: 'Init' });
  }

  // State is ready

  // Logged in?
  if (store.getters.loggedIn) {
    return next();
  }

  // Not logged in

  // Some routes are open
  if (to.meta.requireAuth === false) return next();

  // State ready, closed route and not logged in
  // Redirect to Login
  if (!store.getters.requestedRoute) {
    store.commit('setRequestedRoute', to);
  }
  next({ name: 'Login' });

});

export default router;
