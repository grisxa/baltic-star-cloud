export default class SetTitleMutation {
  type = 'setTitle';
  title: string;

  constructor(title: string) {
    this.title = title;
  }
}
