import {State} from '@/models/state';
import SetBrevetMutation from '@/store/models/setBrevetMutation';
import SetLoadingMutation from '@/store/models/setLoadingMutation';

export const setBrevets = (state: State, payload: SetBrevetMutation): void => {
  state.brevets = payload.brevets;
};

export const setLoading = (state: State, payload: SetLoadingMutation): void => {
  state.loading = payload.loading;
};

export default {setBrevets, setLoading};
