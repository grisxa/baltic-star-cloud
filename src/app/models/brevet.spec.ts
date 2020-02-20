import { Brevet } from './brevet';
import * as firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;

describe('Brevet', () => {
  it('should create an instance', () => {
    expect(new Brevet('1', '2', 3, Timestamp.now())).toBeTruthy();
  });
});
