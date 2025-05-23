import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {MatTableDataSource} from '@angular/material/table';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Title} from '@angular/platform-browser';
import {Observable, of, Subject} from 'rxjs';
import {filter, map, switchMap, takeUntil} from 'rxjs/operators';
import {Rider} from '../../models/rider';
import {AuthService} from '../../services/auth.service';
import {StorageService} from '../../services/storage.service';
import {Barcode} from '../../models/barcode';
import {environment} from '../../../environments/environment';
import {EmailAuthProvider, FacebookAuthProvider, getAuth, GoogleAuthProvider, linkWithRedirect, OAuthProvider} from 'firebase/auth';
import {Timestamp} from 'firebase/firestore';
import {StravaActivityService} from '../../services/strava-activity.service';
import {BarcodeQueueService} from '../../services/barcode-queue.service';

@Component({
  selector: 'app-rider-info',
  templateUrl: './rider-info.component.html',
  styleUrls: ['./rider-info.component.scss']
})
export class RiderInfoComponent implements OnInit, OnDestroy {
  rider?: Rider;
  url?: string;
  formGroup: FormGroup;

  barcodes = new MatTableDataSource<Barcode>();
  barcodeColumnsToDisplay = ['time', 'code', 'message'];
  archive = new MatTableDataSource();
  archiveColumnsToDisplay = ['time', 'code', 'sent'];

  providers = [
    {
      name: 'oidc.balticstar',
      disabled: false,
      cssClass: 'baltic-star',
      icon: 'icon_baltic_star',
      iconDisabled: 'icon_baltic_star_bw',
      framework: new OAuthProvider('oidc.balticstar')
    },
    {
      name: 'google.com',
      disabled: false,
      cssClass: 'google',
      icon: 'icon_google',
      iconDisabled: 'icon_google_bw',
      framework: new GoogleAuthProvider()
    },
    {
      name: 'facebook.com',
      disabled: false,
      cssClass: 'facebook',
      icon: 'icon_facebook',
      // the same
      iconDisabled: 'icon_facebook',
      framework: new FacebookAuthProvider()
    },
  ];
  private unsubscribe$ = new Subject();
  private rider$: Observable<Rider|undefined> = of(undefined);

  constructor(private route: ActivatedRoute,
              private titleService: Title,
              public auth: AuthService,
              public dialog: MatDialog,
              private strava: StravaActivityService,
              private storage: StorageService,
              private queue: BarcodeQueueService,
              private snackBar: MatSnackBar) {
    this.formGroup = new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      country: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      code: new FormControl('', Validators.required),
      signed: new FormControl(false, Validators.required),
      birthDate: new FormControl(new Date(), Validators.required)
    });
  }

  ngOnInit() {
    this.titleService.setTitle('Участник');
    this.archive.data = this.queue.listQueue();
    this.route.paramMap.pipe(
      map(params => params.get('uid')),
      filter(riderUid => !!riderUid),
      switchMap(riderUid => {
        this.url = window.location.origin + '/r/' + riderUid;
        return this.storage.watchRider(riderUid);
      })
    )
    .subscribe(rider => {
      this.rider$ = of(rider);
      this.storage.watchBarcodes('riders', rider.uid)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((codes: Barcode[]) => this.barcodes.data = codes);
      // this.dataSource.paginator = this.paginator;

      this.rider$
        .pipe(
          takeUntil(this.unsubscribe$),
          filter<Rider | undefined>(Boolean),
          // @ts-ignore
        ).subscribe((rider: Rider) => {
          if (rider.displayName) {
            this.titleService.setTitle(rider.displayName);
          }
          this.rider = Rider.fromDoc(rider);
          this.formGroup.controls.firstName?.setValue(rider.firstName);
          this.formGroup.controls.lastName?.setValue(rider.lastName);
          this.formGroup.controls.country?.setValue(rider.country);
          this.formGroup.controls.code?.setValue(rider.code);
          this.formGroup.controls.city?.setValue(rider.city);
          this.formGroup.controls.birthDate?.setValue(rider.birthDate
            ? rider.birthDate.toDate()
            : null);
          rider.providers?.forEach(linked => {
            const provider = this.providers.find(p => p.name === linked.providerId);
            if (provider) {
              provider.disabled = true;
            }
          });
        });
    });
  }

  // release watchers
  ngOnDestroy() {
    this.unsubscribe$.next();
  }


  logout() {
    this.auth.logout()
      .catch(error => console.error('Logout error', error));
  }

  delete() {
    if (this.rider) {
      const currentUser = getAuth().currentUser;
      const uid = this.rider.uid;
      this.storage.deleteRider(uid)
        .then(() => currentUser?.delete())
        .then(() => this.auth.logout())
        .catch(error => this.snackBar
          .open(`Не удалось удалить участника. ${error.message}`,
            'Закрыть'));
    }
  }

  get isOwner(): boolean {
    return (!!this.auth.user && !!this.rider && this.auth.user.uid === this.rider.owner);
  }

  get isEditable(): boolean {
    return this.auth.isAdmin ||
      (!!this.auth.user && !!this.rider && this.auth.user.uid === this.rider.owner);
  }

  linkProvider(
    name: string,
    provider: OAuthProvider
      | GoogleAuthProvider
      | FacebookAuthProvider
      | EmailAuthProvider) {
    const config = environment.auth.signInOptions?.find(
        (settings: any) => settings.provider === name
      );
    // @ts-ignore
    config?.scopes?.forEach((scope: string) => provider.addScope(scope));
    // @ts-ignore
    if (config?.customParameters) { provider.setCustomParameters(config?.customParameters); }

    if (this.auth.user?.auth) {
      linkWithRedirect(this.auth.user?.auth, provider)
        .catch((error: any) => {
          console.error('Error linking: ', error);
          this.snackBar.open(`Не удалось подключить аккаунт. ${error.message}`,
            'Закрыть');
        });
    }
  }

  get isStravaLinked(): boolean {
    return !!this.rider && !!this.rider.strava;
  }

  linkStrava() {
    if (this.rider) {
      this.rider.stravaRevoke = false;
      return this.storage.updateRider(this.rider)
        .then(() => this.strava.login(`/rider/${this.rider?.uid}`));
    }
    return;
  }

  get isOnline(): boolean {
    return navigator.onLine;
  }

  send() {
    if (navigator.onLine) {
      this.queue.repeatSending(undefined, true);
    }
  }

  updateField(field: string) {
    const control = this.formGroup.get(field);
    if (this.rider === undefined) {
      return;
    }
    if (control && control.valid) {
      // check if the field needs updating
      if (control.value instanceof Date) {
        const value = Timestamp.fromDate(control.value);
        // @ts-ignore
        if (this.rider[field] && this.rider[field].seconds === value.seconds) {
          return;
        } else {
          // @ts-ignore
          this.rider[field] = value;
        }
      } else {
        // @ts-ignore
        if (this.rider[field] === control.value) {
          return;
        } else {
          // @ts-ignore
          this.rider[field] = control.value;
        }
      }

      if (field === 'firstName' || field === 'lastName') {
        this.rider.updateDisplayName();
      }
      this.storage.updateRider(this.rider)
        .catch(error => this.snackBar
          .open(`Не удалось сохранить изменения. ${error.message}`,
            'Закрыть'));
    } else {
      // @ts-ignore
      control?.setValue(this.rider[field] instanceof Timestamp ?
        // @ts-ignore
        this.rider[field].toDate() : this.rider[field]
      );
    }
  }
}
