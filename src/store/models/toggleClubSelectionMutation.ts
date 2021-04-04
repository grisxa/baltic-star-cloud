export default class ToggleClubSelectionMutation {
  type = 'toggleClubSelection';
  id: string;

  constructor(id: string) {
    this.id = id;
  }
}
