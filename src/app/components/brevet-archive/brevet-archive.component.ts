import {Component, Input, OnInit} from '@angular/core';
import {Brevet} from '../../models/brevet';
import {SettingService} from '../../services/setting.service';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-brevet-archive',
  templateUrl: './brevet-archive.component.html',
  styleUrls: ['./brevet-archive.component.scss']
})
export class BrevetArchiveComponent implements OnInit {
  @Input() brevets?: Brevet[];

  constructor(public settings: SettingService, public auth: AuthService) { }

  ngOnInit() {
  }

}
