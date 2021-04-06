import Brevet from '@/models/brevet';
import {State} from '@/models/state';
import SetBrevetMutation from '@/store/models/setBrevetMutation';
import SetLoadingMutation from '@/store/models/setLoadingMutation';
import axios from 'axios';
import {ActionContext} from 'vuex';

export default function (context: ActionContext<State, State>, clubs: string[] = []): void {
  // eslint-disable-next-line prefer-template
  const url = `${process.env.VUE_APP_AWS_API}/brevets?` + clubs
    .map((id) => `club=${id}`)
    .join('&');

  if (!navigator.onLine) {
    console.error('Network error');
    return;
  }

  context.commit(new SetLoadingMutation(true));
  axios
    .get(url, {timeout: 60000})
    .then((response) => {
      const brevets = response.data
        .map((item: Brevet) => new Brevet(item))
        .sort((a: Brevet, b: Brevet) => a.startDate.valueOf() - b.startDate.valueOf());
      context.commit(new SetBrevetMutation(brevets));
    })
    .catch((error) => {
      // TODO: set a state error and show
      console.error('get doc', error.message, error);
    })
    .finally(() => context.commit(new SetLoadingMutation(false)));
}
