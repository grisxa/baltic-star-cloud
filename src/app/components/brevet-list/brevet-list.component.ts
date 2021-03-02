import {Component, OnInit} from '@angular/core';
import {Brevet, BrevetOptions} from '../../models/brevet';

const WEEK_MILLISECONDS = 1000 * 60 * 60 * 24 * 7;

@Component({
  selector: 'app-brevet-list',
  templateUrl: './brevet-list.component.html'
})
export class BrevetListComponent implements OnInit {
  oldBrevets: Brevet[] = [
    new Brevet('Кургальский', {
      uid: '4',
      length: 206,
      startDate: new Date('2021-02-13T05:13:00')
    } as BrevetOptions),
  ];
  newBrevets: Brevet[] = [
    new Brevet('Пушкинский', {
      uid: '1',
      length: 200,
      startDate: new Date('2021-06-19T06:00:00')
    } as BrevetOptions),
    new Brevet('Онего', {
      uid: '2',
      length: 600,
      startDate: new Date('2021-06-26T05:00:00')
    } as BrevetOptions),
    new Brevet('Военный', {
      uid: '3',
      length: 402,
      startDate: new Date('2021-07-03T05:00:00')
    } as BrevetOptions),
  ];

  ngOnInit(): void {
    // add brevets
  }

}
