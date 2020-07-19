import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AngularFireModule} from '@angular/fire';
import {AngularFirestoreModule} from '@angular/fire/firestore';
import {ReactiveFormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

import {AngularFireAuthModule} from '@angular/fire/auth';

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
import {PlotarouteMapComponent} from './components/plotaroute-map/plotaroute-map.component';
import {HttpClientModule} from '@angular/common/http';
import { CheckpointSearchDialogComponent } from './components/checkpoint-search-dialog/checkpoint-search-dialog.component';
import { MapboxDialogComponent } from './components/mapbox-dialog/mapbox-dialog.component';
import {OfflineSwitchComponent} from './components/offline-switch/offline-switch.component';
import {NgxAuthFirebaseUIModule} from 'ngx-auth-firebaseui';
import {LoginComponent} from './components/login/login.component';
import {AfterLoginComponent} from './components/after-login/after-login.component';
import {AngularFireAuthGuard} from '@angular/fire/auth-guard';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatSortModule} from '@angular/material/sort';
import {BrevetListItemComponent} from './components/brevet-list/brevet-list-item/brevet-list-item.component';
import {CheckpointListItemComponent} from './components/brevet-info/checkpoint-list-item/checkpoint-list-item.component';

const appRoutes: Routes = [
  {path: '', redirectTo: 'brevets', pathMatch: 'full'},
  {path: 'rider/:uid', component: RiderInfoComponent},
  {path: 'r/:uid', component: RiderInfoComponent},
  {path: 'brevet/:uid', component: BrevetInfoComponent},
  {path: 'brevet/:brevetUid/checkpoint/:checkpointUid', component: CheckpointInfoComponent},
  {path: 'c/:checkpointUid', component: CheckpointInfoComponent},
  {path: 'riders', component: RiderListComponent},
  {path: 'brevet', component: BrevetListComponent},
  {path: 'brevets', component: BrevetListComponent},
  {
    path: 'checkpoint/:uid/addbarcode',
    component: AddBarcodeComponent,
    canActivate: [AngularFireAuthGuard]
  },
  {path: 'login', component: LoginComponent},
  {
    path: 'after-login',
    component: AfterLoginComponent,
    canActivate: [AngularFireAuthGuard]
  },
  {path: '**', redirectTo: 'brevets'},
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
    DateTimePickerComponent,
    SafeUrlPipe,
    AddBarcodeComponent,
    PlotarouteMapComponent,
    CheckpointSearchDialogComponent,
    MapboxDialogComponent,
    OfflineSwitchComponent,
    LoginComponent,
    AfterLoginComponent,
    BrevetListItemComponent,
    CheckpointListItemComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(
      appRoutes,
      environment.router
    ),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule.enablePersistence({synchronizeTabs: true}),
    NgxAuthFirebaseUIModule.forRoot(environment.firebase,
      () => '[DEFAULT]',
      environment.auth),
    AngularFireAuthModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatButtonModule,
    MatListModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    ReactiveFormsModule,
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
    MatSnackBarModule,
    MatSlideToggleModule,
    MatButtonToggleModule,
    MatSortModule
  ],
  exports: [
  ],
  providers: [],
  entryComponents: [
    AppComponent,
    CheckpointSearchDialogComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
