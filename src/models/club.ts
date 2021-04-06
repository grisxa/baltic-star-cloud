export default class Club {
  id: number;
  country: string;
  name: {
    [key: string]: string;
  };

  constructor(snapshot: Club) {
    // generic copying
    Object.assign(this, snapshot);
    // mandatory fields
    this.id = snapshot.id;
    this.name = snapshot.name;
    this.country = snapshot.country;
  }
}
