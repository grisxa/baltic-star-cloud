import Brevet from '@/models/brevet';
import Checkpoint from '@/models/checkpoint';
import {State} from '@/models/state';
import SetBrevetMutation from '@/store/models/setBrevetMutation';
import SetLoadingMutation from '@/store/models/setLoadingMutation';
import axios from 'axios';
import {ActionContext} from 'vuex';

export default function (context: ActionContext<State, State>): void {
  const url = `${process.env.VUE_APP_AWS_API}/brevets`;

  if (!navigator.onLine) {
    console.error('Network error');
    return;
  }

  context.commit(new SetLoadingMutation(true));
  axios
    .get(url, {timeout: 60000})
    .then((response) => {
      const brevets = response.data
        .map((item: Brevet) => {
          const {checkpoints} = item;
          const objCP = checkpoints instanceof Array ? checkpoints.filter((cp) => !!cp)
            .map((cp) => new Checkpoint(cp)) : checkpoints;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          return new Brevet({
            ...item,
            startDate: new Date(item.startDate),
            endDate: (item.endDate && new Date(item.endDate)),
            checkpoints: objCP,
          });
        })
        .sort((a: Brevet, b: Brevet) => a.startDate.valueOf() - b.startDate.valueOf());
      context.commit(new SetBrevetMutation(brevets));
    })
    .catch((error) => {
      // TODO: set a state error and show
      console.error('get doc', error.message, error);
    })
    .finally(() => context.commit(new SetLoadingMutation(false)));
}
