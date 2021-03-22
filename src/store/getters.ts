import Brevet from '@/models/brevet';
import {State} from '@/models/state';

const WEEK_MILLISECONDS = 1000 * 60 * 60 * 24 * 7;

export const oldBrevets = (state: State): Brevet[] => {
  const now = Date.now();
  return state.brevets.filter((brevet) => (
    (brevet.endDate instanceof Date && brevet.endDate.valueOf() < now)
    || brevet.startDate?.valueOf() < now - WEEK_MILLISECONDS));
};

export const newBrevets = (state: State): Brevet[] => {
  const now = Date.now();
  return state.brevets.filter((brevet) => (
    (brevet.endDate instanceof Date && brevet.endDate.valueOf() >= now)
    || brevet.startDate?.valueOf() >= now - WEEK_MILLISECONDS));
};

export const getBrevet = (state: State) => (uid: string): Brevet | undefined => state.brevets
  .find((brevet) => brevet.uid === uid);

export const isLoading = (state: State): boolean => state.loading;

export default {oldBrevets, newBrevets, getBrevet, isLoading};
