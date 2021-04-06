import Brevet from '@/models/brevet';
import SetLoadingMutation from '@/store/models/setLoadingMutation';
import UpdateBrevetMutation from '@/store/models/updateBrevetMutation';
import {cacheAction} from 'vuex-cache';

export default cacheAction(
  ({cache, commit}, uid: string): Promise<void | Brevet> => {
    commit(new SetLoadingMutation(true));

    return cache.dispatch('apiRequest', `brevet/${uid}`)
      .then((response) => {
        const brevet = new Brevet(response.data);

        commit(new UpdateBrevetMutation(brevet));
        return brevet;
      })
      .catch((error) => {
        // TODO: set a state error and show
        console.error('get doc', error.message, error);
      })
      .finally(() => commit(new SetLoadingMutation(false)));
  },
);
