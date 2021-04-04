import {State} from '@/models/state';
import actions from '@/store/actions';
import getters from '@/store/getters';
import mutations from '@/store/mutations';
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store<State>({
  strict: true,
  state: {
    clubs: [],
    clubSelection: [],
    brevets: [],
    loading: false,
    locale: process.env.VUE_APP_I18N_LOCALE,
  },
  getters,
  mutations,
  actions,
  modules: {},
});
