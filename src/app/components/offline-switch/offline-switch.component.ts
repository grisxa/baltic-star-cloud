import {Component} from '@angular/core';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-offline-switch',
  templateUrl: './offline-switch.component.html',
  styleUrls: ['./offline-switch.component.scss']
})
export class OfflineSwitchComponent {
  online = true;
  status = 'Онлайн';

  constructor() {
  }

  onChange() {
    this.online = !this.online;
    this.status = this.online ? 'Онлайн' : 'Оффлайн';
    if (this.online) {
      firebase.firestore().enableNetwork()
        .then(() => console.log('= went online'))
        .catch(error => console.error('= network switching failed', error));
    } else {
      firebase.firestore().disableNetwork()
        .then(() => console.log('= went offline'))
        .catch(error => console.error('= network switching failed', error));
    }
  }
}
