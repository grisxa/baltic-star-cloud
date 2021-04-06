import {State} from '@/models/state';
import axios, {AxiosResponse} from 'axios';
import {ActionContext} from 'vuex';

export default function
(context: ActionContext<State, State>, path: string): Promise<void | AxiosResponse> {
  const url = `${process.env.VUE_APP_AWS_API}/${path}`;

  if (!navigator.onLine) {
    console.error('Network error');
    return Promise.reject(new Error('Network error'));
  }

  return axios.get(url, {timeout: 60000})
    .catch((error) => {
      console.error('REST API error', error.message, error);
    });
}
