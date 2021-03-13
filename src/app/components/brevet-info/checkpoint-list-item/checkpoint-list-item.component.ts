import {Component, Input, OnInit} from '@angular/core';
import {Checkpoint} from '../../../models/checkpoint';

@Component({
  selector: 'app-checkpoint-list-item',
  templateUrl: './checkpoint-list-item.component.html',
  styleUrls: ['./checkpoint-list-item.component.scss']
})
export class CheckpointListItemComponent implements OnInit {
  @Input() checkpoint: Checkpoint;

  constructor() { }

  ngOnInit(): void {
  }

}
