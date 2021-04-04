export default class SetLocaleMutation {
  type = 'setLocale';
  locale: string;

  constructor(locale: string) {
    this.locale = locale;
  }
}
