import Brevet from '@/models/brevet';
import Club from '@/models/club';
import {State} from '@/models/state';
import actions from '@/store/actions';
import getters from '@/store/getters';
import mutations from '@/store/mutations';
import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

Vue.use(Vuex);

const STORAGE_KEY = 'brevet_online_storage';

const rehydrate = (key: string, storage: unknown) => JSON
  .parse((storage as Storage).getItem(key) || 'null', (name, value) => {
    // string to Date conversion
    if (['startDate', 'endDate'].includes(name)) {
      return new Date(value);
    }
    if (name === 'brevets') {
      return value.map((item: Brevet) => new Brevet(item));
    }
    if (name === 'clubs') {
      return value.map((item: Club) => new Club(item));
    }
    return value;
  });

export default new Vuex.Store<State>({
  strict: true,
  state: {
    clubs: [],
    clubSelection: [],
    brevets: [],
    loading: false,
    locale: process.env.VUE_APP_I18N_LOCALE,
  },
  plugins: [createPersistedState({
    key: STORAGE_KEY,
    getState: rehydrate,
  })],
  getters,
  mutations,
  actions,
  modules: {},
});
