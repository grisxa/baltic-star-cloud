import Vue from 'vue';

Vue.filter('dateFilter',
  (date: Date, locale: string) => date.toLocaleDateString(locale));
Vue.filter('timeFilter',
  (date: Date, locale: string) => date.toLocaleTimeString(locale));
