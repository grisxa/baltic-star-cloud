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
    brevets: [],
    loading: false,
  },
  getters,
  mutations,
  actions,
  modules: {},
});
