import Club from '@/models/club';
import {State} from '@/models/state';
import SetClubsMutation from '@/store/models/setClubsMutation';
import SetLoadingMutation from '@/store/models/setLoadingMutation';
import axios from 'axios';
import {ActionContext} from 'vuex';

export default function (context: ActionContext<State, State>): void {
  const url = `${process.env.VUE_APP_AWS_API}/clubs`;

  if (!navigator.onLine) {
    console.error('Network error');
    return;
  }

  context.commit(new SetLoadingMutation(true));
  axios
    .get(url, {timeout: 60000})
    .then((response) => {
      const clubs = response.data
        .map((item: Club) => new Club(item))
        // order by the club ID number
        .sort((a: Club, b: Club) => a.id - b.id);
      context.commit(new SetClubsMutation(clubs));
    })
    .catch((error) => {
      // TODO: set a state error and show
      console.error('get doc', error.message, error);
    })
    .finally(() => context.commit(new SetLoadingMutation(false)));
}
