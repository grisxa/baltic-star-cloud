import {Component, Input} from '@angular/core';

import {Brevet} from '../../../models/brevet';

@Component({
  selector: 'app-brevet-list-item',
  templateUrl: './brevet-list-item.component.html',
  styleUrls: ['./brevet-list-item.component.scss']
})
export class BrevetListItemComponent {
  @Input() brevet: Brevet;
}
