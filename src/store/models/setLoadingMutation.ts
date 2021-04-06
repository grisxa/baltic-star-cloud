export default class SetLoadingMutation {
  type = 'setLoading';
  loading: boolean;

  constructor(loading: boolean) {
    this.loading = loading;
  }
}
