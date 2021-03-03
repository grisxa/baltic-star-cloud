import {Component, Input} from '@angular/core';
import {Brevet} from '../../models/brevet';

@Component({
  selector: 'app-brevet-archive',
  templateUrl: './brevet-archive.component.html',
  styleUrls: ['./brevet-archive.component.scss']
})
export class BrevetArchiveComponent {
  @Input() brevets: Brevet[];
  panelOpenState = false;
}
