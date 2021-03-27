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
  @Input() brevet: Brevet;

  constructor(public auth: AuthService,
              private storage: StorageService,
              private snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
  }

  deleteBrevet(uid: string) {
    console.log('= delete brevet', uid);
    this.storage.deleteBrevet(uid)
      .then(() => {
        console.log(`= removed brevet ${uid}`);
      })
      .catch(error => {
        console.error('brevet removal has failed', error);
        this.snackBar.open(`Не удалось удалить бревет. ${error.message}`,
          'Закрыть', {duration: 5000});
      });
  }
}
