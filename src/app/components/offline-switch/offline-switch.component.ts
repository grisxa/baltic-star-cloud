import {Component} from '@angular/core';
import {disableNetwork, enableNetwork, getFirestore} from '@angular/fire/firestore';


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
      enableNetwork(getFirestore())
        .catch(error => console.error('= network switching failed', error));
    } else {
      disableNetwork(getFirestore())
        .catch(error => console.error('= network switching failed', error));
    }
  }
}
