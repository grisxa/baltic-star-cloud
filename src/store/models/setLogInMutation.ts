export default class SetLogInMutation {
  type = 'setLogIn';
  loggedIn: boolean;

  constructor(loggedIn: boolean) {
    this.loggedIn = loggedIn;
  }
}
