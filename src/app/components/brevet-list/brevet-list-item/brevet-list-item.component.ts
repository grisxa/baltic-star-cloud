import {Component, Input, OnInit} from '@angular/core';
import {AuthService} from '../../../services/auth.service';
import {StorageService} from '../../../services/storage.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Brevet} from '../../../models/brevet';

@Component({
  selector: 'app-brevet-list-item',
  templateUrl: './brevet-list-item.component.html'
})
export class BrevetListItemComponent implements OnInit {
  @Input() brevet?: Brevet;

  constructor(public auth: AuthService,
              private storage: StorageService,
              private snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
  }

  deleteBrevet(uid: string) {
    this.storage.deleteBrevet(uid)
      .catch(error => this.snackBar
        .open(`Не удалось удалить бревет. ${error.message}`,
          'Закрыть'));
  }
}
