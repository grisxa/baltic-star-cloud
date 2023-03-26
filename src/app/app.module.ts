import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {connectFirestoreEmulator, enableMultiTabIndexedDbPersistence, provideFirestore} from '@angular/fire/firestore';
import {ReactiveFormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatNativeDateModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatRadioModule} from '@angular/material/radio';
import {MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatTableModule} from '@angular/material/table';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {provideAuth} from '@angular/fire/auth';
import {connectFunctionsEmulator, getFunctions, provideFunctions} from '@angular/fire/functions';
import {AppComponent} from './app.component';
import {environment} from '../environments/environment';
import {RiderInfoComponent} from './components/rider-info/rider-info.component';
import {CheckpointInfoComponent} from './components/checkpoint-info/checkpoint-info.component';
import {RiderListComponent} from './components/rider-list/rider-list.component';
import {BrevetListComponent} from './components/brevet-list/brevet-list.component';
import {BrevetInfoComponent} from './components/brevet-info/brevet-info.component';
import {BrevetArchiveComponent} from './components/brevet-archive/brevet-archive.component';
import {LoginPromptComponent} from './components/login-prompt/login-prompt.component';
import {ViewModeDirective} from './directives/view-mode.directive';
import {EditModeDirective} from './directives/edit-mode.directive';
import {EditableComponent} from './components/editable/editable.component';
import {AddButtonComponent} from './components/add-button/add-button.component';
import {DateTimePickerComponent} from './components/date-time-picker/date-time-picker.component';
import {SafeUrlPipe} from './pipes/safe-url.pipe';
import {QRCodeModule} from 'angularx-qrcode';
import {AddBarcodeComponent} from './components/add-barcode/add-barcode.component';
import {NgxBarcode6Module} from 'ngx-barcode6';
import {ScannerDialogModule} from './scanner-dialog/scanner-dialog.module';
import {HttpClientModule} from '@angular/common/http';
import {CheckpointSearchDialogComponent} from './components/checkpoint-search-dialog/checkpoint-search-dialog.component';
import {MapboxDialogComponent} from './components/mapbox-dialog/mapbox-dialog.component';
import {OfflineSwitchComponent} from './components/offline-switch/offline-switch.component';
import {LoginComponent} from './components/login/login.component';
import {canActivate, redirectUnauthorizedTo} from '@angular/fire/auth-guard';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatSortModule} from '@angular/material/sort';
import {BrevetListItemComponent} from './components/brevet-list/brevet-list-item/brevet-list-item.component';
import {CheckpointListItemComponent} from './components/brevet-info/checkpoint-list-item/checkpoint-list-item.component';
import {ServiceWorkerModule} from '@angular/service-worker';
import {MapboxLocationDialogComponent} from './components/mapbox-location-dialog/mapbox-location-dialog.component';
import {MatSelectModule} from '@angular/material/select';
import {MapboxRouteComponent} from './components/mapbox-route/mapbox-route.component';
import {getFirestore} from 'firebase/firestore';
import {provideFirebaseApp} from '@angular/fire/app';
import {connectAuthEmulator, getAuth} from 'firebase/auth';
import {initializeApp} from 'firebase/app';
import {AngularFirestoreModule} from '@angular/fire/compat/firestore';
import {AfterStravaComponent} from './components/after-strava/after-strava.component';
import {MatExpansionModule} from '@angular/material/expansion';
import {SaveListButtonComponent} from './components/save-list-button/save-list-button.component';

const appRoutes: Routes = [
  {path: '', component: BrevetListComponent, pathMatch: 'full'},
  {path: 'rider/:uid', component: RiderInfoComponent},
  // a shortcut
  {path: 'r/:uid', component: RiderInfoComponent},
  {path: 'brevet/:uid', component: BrevetInfoComponent},
  {path: 'brevet/:brevetUid/checkpoint/:checkpointUid', component: CheckpointInfoComponent},
  // a shortcut
  {path: 'c/:checkpointUid', component: CheckpointInfoComponent},
  {path: 'riders', component: RiderListComponent},
  {path: 'brevet', component: BrevetListComponent},
  {path: 'brevets', component: BrevetListComponent},
  {path: 'after-strava', component: AfterStravaComponent},
  {
    path: 'checkpoint/:uid/addbarcode',
    component: AddBarcodeComponent,
    ...canActivate(() => redirectUnauthorizedTo(['login']))
  },
  {
    path: 'login',
    children: [{path: '**', component: LoginComponent}]
  },
  {path: '**', component: BrevetListComponent},
];

@NgModule({
  declarations: [
    AppComponent,
    RiderInfoComponent,
    CheckpointInfoComponent,
    RiderListComponent,
    BrevetListComponent,
    BrevetInfoComponent,
    BrevetArchiveComponent,
    LoginPromptComponent,
    ViewModeDirective,
    EditModeDirective,
    EditableComponent,
    AddButtonComponent,
    SaveListButtonComponent,
    DateTimePickerComponent,
    SafeUrlPipe,
    AddBarcodeComponent,
    CheckpointSearchDialogComponent,
    MapboxDialogComponent,
    MapboxLocationDialogComponent,
    OfflineSwitchComponent,
    LoginComponent,
    AfterStravaComponent,
    BrevetListItemComponent,
    CheckpointListItemComponent,
    MapboxRouteComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(
      appRoutes,
      environment.router
    ),
    AngularFirestoreModule.enablePersistence({synchronizeTabs: true}),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => {
      const firestore = getFirestore();
      if (environment.useEmulators) {
        connectFirestoreEmulator(firestore, 'localhost', 8080);
      }
      enableMultiTabIndexedDbPersistence(firestore)
        .then(() => console.log('Firestore persistence on'))
        .catch(error => console.error('Firestore persistence failure'));
      return firestore;
    }),
    provideFunctions(() => {
      const functions = getFunctions();
      if (environment.useEmulators) {
        connectFunctionsEmulator(functions, 'localhost', 5001);
      }
      return functions;
    }),
    provideAuth(() => {
      const auth = getAuth();
      if (environment.useEmulators) {
        connectAuthEmulator(auth, 'http://localhost:9099');
      }
      return auth;
    }),
    BrowserAnimationsModule,
    HttpClientModule,
    MatButtonModule,
    MatListModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    QRCodeModule,
    NgxBarcode6Module,
    MatCheckboxModule,
    ScannerDialogModule,
    MatDialogModule,
    MatRadioModule,
    MatSelectModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatButtonToggleModule,
    MatSortModule,
    ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production})
  ],
  exports: [],
  providers: [
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: {verticalPosition: 'top', duration: 5000}
    },
  ],
  entryComponents: [
    AppComponent,
    CheckpointSearchDialogComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
