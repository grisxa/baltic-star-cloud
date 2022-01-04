import {Component, Input, OnInit} from '@angular/core';
import {AuthService} from '../../../services/auth.service';
import {StorageService} from '../../../services/storage.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Checkpoint} from '../../../models/checkpoint';

@Component({
  selector: 'app-checkpoint-list-item',
  templateUrl: './checkpoint-list-item.component.html',
  styleUrls: ['./checkpoint-list-item.component.scss']
})
export class CheckpointListItemComponent implements OnInit {
  @Input() checkpoint?: Checkpoint;

  constructor(public auth: AuthService,
              private storage: StorageService,
              private snackBar: MatSnackBar) { }

  ngOnInit(): void {
  }

  deleteCheckpoint(uid: string) {
    if (!this.checkpoint?.brevet?.uid) {
      return;
    }
    this.storage.deleteCheckpoint(this.checkpoint.brevet.uid, uid)
      .catch(error => this.snackBar
        .open(`Не удалось удалить КП. ${error.message}`,
          'Закрыть'));
  }
}
