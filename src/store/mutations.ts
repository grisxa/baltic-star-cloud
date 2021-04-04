import {State} from '@/models/state';
import SetBrevetMutation from '@/store/models/setBrevetMutation';
import SetClubsMutation from '@/store/models/setClubsMutation';
import SetLoadingMutation from '@/store/models/setLoadingMutation';
import SetLocaleMutation from '@/store/models/setLocaleMutation';
import ToggleClubSelectionMutation from '@/store/models/toggleClubSelectionMutation';

export const setBrevets = (state: State, payload: SetBrevetMutation): void => {
  state.brevets = payload.brevets;
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
export default {
  setBrevets,
  setClubs,
  toggleClubSelection,
  setLoading,
  setLocale,
};
