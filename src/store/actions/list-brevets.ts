import Brevet from '@/models/brevet';
import SetBrevetMutation from '@/store/models/setBrevetMutation';
import SetLoadingMutation from '@/store/models/setLoadingMutation';
import {cacheAction} from 'vuex-cache';

export default cacheAction(
  ({cache, commit}, clubs: string[] = []): Promise<Brevet[]> => {
    // eslint-disable-next-line prefer-template
    const url = 'brevets?' + clubs.map((id) => `club=${id}`).join('&');

    commit(new SetLoadingMutation(true));

    return cache.dispatch('apiRequest', url)
      .then((response) => {
        const brevets = response.data
          .map((item: Brevet) => new Brevet(item))
          .sort((a: Brevet, b: Brevet) => a.startDate.valueOf() - b.startDate.valueOf());

        commit(new SetBrevetMutation(brevets));
        return brevets;
      })
      .catch((error) => {
        // TODO: set a state error and show
        console.error('get doc', error.message, error);
      })
      .finally(() => commit(new SetLoadingMutation(false)));
  },
);
