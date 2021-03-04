import {Component, Input} from '@angular/core';

import {Brevet} from '../../../models/brevet';

const HOURS_100_MILLISECONDS = 100*60*60*1000;

@Component({
  selector: 'app-brevet-list-item',
  templateUrl: './brevet-list-item.component.html',
  styleUrls: ['./brevet-list-item.component.scss']
})
export class BrevetListItemComponent {
  @Input() brevet: Brevet;

  isOnline(): boolean {
    if (!this.brevet) {
      return false;
    }
    const now = Date.now();
    const endDate = this.brevet.endDate ||
      new Date(this.brevet.startDate.getTime() + HOURS_100_MILLISECONDS);
    return (now > this.brevet.startDate.valueOf() && now < endDate.valueOf());
  }
}
