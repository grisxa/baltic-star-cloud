import Brevet from '@/models/brevet';
import {State} from '@/models/state';
import SetLoadingMutation from '@/store/models/setLoadingMutation';
import UpdateBrevetMutation from '@/store/models/updateBrevetMutation';
import axios from 'axios';
import {ActionContext} from 'vuex';

export default function (context: ActionContext<State, State>, id: string): void {
  const url = `${process.env.VUE_APP_AWS_API}/brevet/${id}`;

  if (!navigator.onLine) {
    console.error('Network error');
    return;
  }

  context.commit(new SetLoadingMutation(true));
  axios
    .get(url, {timeout: 60000})
    .then((response) => {
      const brevet = new Brevet(response.data);
      context.commit(new UpdateBrevetMutation(brevet));
    })
    .catch((error) => {
      // TODO: set a state error and show
      console.error('get doc', error.message, error);
    })
    .finally(() => context.commit(new SetLoadingMutation(false)));
}
