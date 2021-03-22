import Brevet from '@/models/brevet';
import Checkpoint from '@/models/checkpoint';
import {State} from '@/models/state';
import {loadMap} from '@/store/models/firestore';
import SetBrevetMutation from '@/store/models/setBrevetMutation';
import SetLoadingMutation from '@/store/models/setLoadingMutation';
import axios from 'axios';
import {ActionContext} from 'vuex';

export default function (context: ActionContext<State, State>): void {
  const suffix = '.beta';
  const base = 'https://firestore.googleapis.com/v1';
  const projectId = 'baltic-star-cloud';
  const path = `brevets${suffix}/list`;
  const url = `${base}/projects/${projectId}/databases/(default)/documents/${path}`;

  if (!navigator.onLine) {
    console.error('Network error');
    return;
  }

  context.commit(new SetLoadingMutation(true));
  axios
    .get(url, {timeout: 60000})
    .then((response) => {
      // console.log('raw reply', response.data);
      const data = loadMap(response.data);
      // console.log(' = got brevets', data);
      if (data.brevets instanceof Array) {
        const brevets = data.brevets
          .map((item) => {
            const {checkpoints} = item as any;
            const objCP = checkpoints instanceof Array ? checkpoints.filter((cp) => !!cp)
              .map((cp) => new Checkpoint(cp)) : checkpoints;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            return new Brevet({...item, checkpoints: objCP});
          });
        context.commit(new SetBrevetMutation(brevets));
      }
    })
    .catch((error) => {
      // TODO: set a steate error and show
      console.error('get doc', error.message, error);
    })
    .finally(() => context.commit(new SetLoadingMutation(false)));
}
