import Brevet from '@/models/brevet';
import {State} from '@/models/state';
import SetBrevetsMutation from '@/store/models/setBrevetsMutation';
import SetClubsMutation from '@/store/models/setClubsMutation';
import SetLoadingMutation from '@/store/models/setLoadingMutation';
import SetLocaleMutation from '@/store/models/setLocaleMutation';
import ToggleClubSelectionMutation from '@/store/models/toggleClubSelectionMutation';
import UpdateBrevetMutation from '@/store/models/updateBrevetMutation';

export const setBrevets = (state: State, payload: SetBrevetsMutation): void => {
  const known = state.brevets.reduce((dict: { [uid: string]: Brevet }, brevet) => {
    // eslint-disable-next-line no-param-reassign
    dict[brevet.uid] = brevet;
    return dict;
  }, {});
  state.brevets = [...payload.brevets
    .map((brevet) => (brevet.uid in known ? known[brevet.uid] : brevet)),
  ].sort((a: Brevet, b: Brevet) => a.startDate.valueOf() - b.startDate.valueOf());
};

export const setClubs = (state: State, payload: SetClubsMutation): void => {
  state.clubs = payload.clubs;
};

export const toggleClubSelection = (state: State, payload: ToggleClubSelectionMutation): void => {
  const index = state.clubSelection.indexOf(payload.id);
  const updated = state.clubSelection.slice();
  if (index === -1) {
    updated.push(payload.id);
  } else {
    updated.splice(index, 1);
  }
  state.clubSelection = updated;
};

export const setLoading = (state: State, payload: SetLoadingMutation): void => {
  state.loading = payload.loading;
};

export const setLocale = (state: State, payload: SetLocaleMutation): void => {
  state.locale = payload.locale;
};

export const updateBrevet = (state: State, payload: UpdateBrevetMutation): void => {
  const rest = state.brevets.filter((item) => item.uid !== payload.brevet.uid);
  state.brevets = [...rest, payload.brevet]
    .sort((a: Brevet, b: Brevet) => a.startDate.valueOf() - b.startDate.valueOf());
};

export default {
  setBrevets,
  setClubs,
  toggleClubSelection,
  setLoading,
  setLocale,
  updateBrevet,
};
