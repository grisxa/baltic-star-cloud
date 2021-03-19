import Vue from 'vue';
import App from './App.vue';
import elements from './elements';
import i18n from './i18n';
import './registerServiceWorker';
import router from './router';
import store from './store';

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  i18n,
  ...elements,
  render: (h) => h(App),
}).$mount('#app');
