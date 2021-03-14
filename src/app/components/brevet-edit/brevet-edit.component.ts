import {Location} from '@angular/common';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ActivatedRoute} from '@angular/router';
import {Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {Brevet} from '../../models/brevet';
import {Loading} from '../../models/loading';
import {CloudFirestoreService} from '../../services/storage/cloud-firestore.service';

@Component({
  selector: 'app-brevet-edit',
  templateUrl: './brevet-edit.component.html',
  styleUrls: ['./brevet-edit.component.scss']
})
export class BrevetEditComponent extends Loading implements OnInit, OnDestroy {
  brevet: Brevet;
  brevetForm: FormGroup;
  formDirty = false;

  private unsubscribe$ = new Subject();
  private brevet$: Observable<Brevet>;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private storage: CloudFirestoreService,
    private snackBar: MatSnackBar,
  ) {
    super();
  }

  ngOnInit(): void {
    this.brevetForm = new FormGroup({
      name: new FormControl('', Validators.required),
      length: new FormControl(0, [Validators.required, Validators.pattern('[0-9]+')]),
      startDate: new FormControl(new Date(), Validators.required),
      mapUrl: new FormControl('', Validators.required),
    });
    // watch the form changes and allow saving then
    this.brevetForm.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => this.formDirty = true);

    this.loading = true;
    this.route.paramMap.subscribe(params => {
      this.brevet$ = this.storage.getBrevet(params.get('uid'));
      this.brevet$
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(brevet => {
          this.brevet = brevet;
          this.loading = false;
          this.brevetForm.get('name').setValue(brevet.name);
          this.brevetForm.get('length').setValue(brevet.length);
          this.brevetForm.get('mapUrl').setValue(brevet.mapUrl);
          // it's safer to have a fallback
          this.brevetForm.get('startDate').setValue(brevet.startDate || new Date());
          // initial values have been loaded
          this.formDirty = false;
        });
    });
  }

  // release watchers
  ngOnDestroy() {
    this.unsubscribe$.next();
  }

  onSubmit() {
    console.log(' = submit', this.brevetForm.value);
    if (!this.brevetForm.valid) {
      console.error('Brevet settings invalid');
      return;
    }
    Object.assign(this.brevet, this.brevetForm.value);
    console.log(`= update brevet`, this.brevet);
    this.storage.updateBrevet(this.brevet)
      .then(() => {
        console.log(`= updated brevet ${this.brevet.uid}`);
        this.location.back();
      })
      .catch(error => {
        console.error('brevet update has failed', error);
        this.snackBar.open($localize `Changes saving has failed. ` + error.message,
          $localize `Close`, {duration: 5000});
      });
  }

  onCancel() {
    this.location.back();
  }
}
