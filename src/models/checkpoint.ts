import GeoPoint from 'geopoint';

export default class Checkpoint {
  name: string;
  uid: string;

  // to the start by track
  distance: number;

  // to the current position
  delta?: number;

  // TODO: convert lan/lng
  coordinates?: GeoPoint;

  // it's a sleeping place
  sleep?: boolean;

  // no volunteers
  selfCheck?: boolean;

  constructor(snapshot: Checkpoint) {
    // generic copying
    Object.assign(this, snapshot);
    // mandatory fields
    this.uid = snapshot.uid;
    this.name = snapshot.name;
    this.distance = snapshot.distance;
  }
}
