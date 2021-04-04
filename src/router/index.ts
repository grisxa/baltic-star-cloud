import BrevetInfo from '@/views/BrevetInfo.vue';
import BrevetList from '@/views/BrevetList.vue';
import Vue from 'vue';
import VueRouter, {RouteConfig} from 'vue-router';

Vue.use(VueRouter);

type MenuRoute = RouteConfig & {
  id: string;
  showInMenu: boolean;
  icon: string;
  title: string;
};

export const routes: Array<MenuRoute> = [
  {
    id: '1',
    showInMenu: true,
    icon: 'el-icon-notebook-2',
    title: 'Route.brevetList',
    path: '/brevets',
    name: 'brevet-list',
    component: BrevetList,
  },
  {
    id: '2',
    showInMenu: false,
    icon: 'el-icon-map-location',
    title: 'Route.brevetInfo',
    path: '/brevet/:uid',
    name: 'brevet-info',
    component: BrevetInfo,
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
