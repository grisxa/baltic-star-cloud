import BrevetInfo from '@/views/BrevetInfo.vue';
import BrevetList from '@/views/BrevetList.vue';
import Vue from 'vue';
import VueRouter, {RouteConfig} from 'vue-router';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/brevets',
    name: 'brevet-list',
    component: BrevetList,
  },
  {
    path: '/brevet/:uid',
    name: 'brevet-info',
    component: BrevetInfo,
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    // component: () => import(/* webpackChunkName: "about" */ '../views/BrevetInfo.vue'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
