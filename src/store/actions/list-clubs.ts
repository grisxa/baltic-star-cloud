import Club from '@/models/club';
import SetClubsMutation from '@/store/models/setClubsMutation';
import SetLoadingMutation from '@/store/models/setLoadingMutation';
import {cacheAction} from 'vuex-cache';

export default cacheAction(
  ({cache, commit}): Promise<Club[]> => {
    commit(new SetLoadingMutation(true));

    return cache.dispatch('apiRequest', 'clubs')
      .then((response) => {
        const clubs = response.data
          .map((item: Club) => new Club(item))
          // order by the club ID number
          .sort((a: Club, b: Club) => a.id - b.id);

        commit(new SetClubsMutation(clubs));
        return clubs;
      })
      .catch((error) => {
        // TODO: set a state error and show
        console.error('get doc', error.message, error);
      })
      .finally(() => commit(new SetLoadingMutation(false)));
  },
);
