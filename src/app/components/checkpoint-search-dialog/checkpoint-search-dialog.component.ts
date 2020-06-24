import {Component, Inject} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {Checkpoint} from '../../models/checkpoint';
import {SelectionModel} from '@angular/cdk/collections';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-checkpoint-search-dialog',
  templateUrl: './checkpoint-search-dialog.component.html',
  styleUrls: ['./checkpoint-search-dialog.component.scss']
})
export class CheckpointSearchDialogComponent {

  checkpoints = new MatTableDataSource<Checkpoint>();
  checkpointColumnsToDisplay = ['select', 'displayName', 'distance'];
  selection = new SelectionModel<Checkpoint>(false, []);

  constructor(@Inject(MAT_DIALOG_DATA) public data: Checkpoint[]) {
    this.checkpoints.data = data;
  }
}
