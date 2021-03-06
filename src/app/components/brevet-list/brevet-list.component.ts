import {Component, OnInit} from '@angular/core';
import {Brevet} from '../../models/brevet';
import {CloudFirestoreService} from '../../services/storage/cloud-firestore.service';

const WEEK_MILLISECONDS = 1000 * 60 * 60 * 24 * 7;

@Component({
  selector: 'app-brevet-list',
  templateUrl: './brevet-list.component.html',
  styleUrls: ['./brevet-list.component.scss']
})
export class BrevetListComponent implements OnInit {
  oldBrevets: Brevet[] = [];
  newBrevets: Brevet[] = [];

  constructor(private storage: CloudFirestoreService) {
  }

  ngOnInit(): void {
    const now = Date.now();
    this.storage.listBrevets()
      .subscribe((brevets: Brevet[]) => brevets.forEach(brevet => {
        // the old brevet either has finished
        // or started a week ago (and thus has finished as well)
        if (brevet.endDate?.valueOf() < now ||
          brevet.startDate.valueOf() < now - WEEK_MILLISECONDS) {
          // order from recent to older
          this.oldBrevets.unshift(brevet);
        } else {
          // keep ordering by startDate increasing
          this.newBrevets.push(brevet);
        }
      }));
  }

}
