import {Component} from '@angular/core';
import firebase from 'firebase/app';

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
        .catch(error => console.error('= network switching failed', error));
    } else {
      firebase.firestore().disableNetwork()
        .catch(error => console.error('= network switching failed', error));
    }
  }
}
