import BrevetInfo from '@/views/BrevetInfo.vue';
import BrevetList from '@/views/BrevetList.vue';
import Vue from 'vue';
import VuePageTitle from 'vue-page-title';
import VueRouter, {RouteConfig} from 'vue-router';

Vue.use(VueRouter);
Vue.use(VuePageTitle);

type MenuRoute = RouteConfig & {
  meta: {
    id: string;
    showInMenu: boolean;
    icon: string;
    title: string;
  }
};

export const routes: Array<MenuRoute> = [
  {
    path: '/brevets',
    name: 'brevet-list',
    component: BrevetList,
    meta: {
      id: '1',
      showInMenu: true,
      icon: 'el-icon-notebook-2',
      title: 'Route.brevetList',
    },
  },
  {
    path: '/brevet/:uid',
    name: 'brevet-info',
    component: BrevetInfo,
    meta: {
      id: '2',
      showInMenu: false,
      icon: 'el-icon-map-location',
      title: 'Route.brevetInfo',
    },
  },
  // route level code-splitting
  // this generates a separate chunk (about.[hash].js) for this route
  // which is lazy-loaded when the route is visited.
  // component: () => import(/* webpackChunkName: "about" */ '../views/BrevetInfo.vue'),
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
