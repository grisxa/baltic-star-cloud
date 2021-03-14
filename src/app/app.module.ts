import {NgModule} from '@angular/core';
import {AngularFireModule} from '@angular/fire';
import {AngularFirestoreModule} from '@angular/fire/firestore';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatNativeDateModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatSelectModule} from '@angular/material/select';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ServiceWorkerModule} from '@angular/service-worker';

import {environment} from '../environments/environment';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrevetArchiveComponent} from './components/brevet-archive/brevet-archive.component';
import {BrevetEditComponent} from './components/brevet-edit/brevet-edit.component';
import {BrevetInfoComponent} from './components/brevet-info/brevet-info.component';
import {CheckpointListItemComponent} from './components/brevet-info/checkpoint-list-item/checkpoint-list-item.component';
import {BrevetListItemComponent} from './components/brevet-list/brevet-list-item/brevet-list-item.component';
import {BrevetListComponent} from './components/brevet-list/brevet-list.component';
import {DateTimePickerComponent} from './components/date-time-picker/date-time-picker.component';
import {LanguageSelectorComponent} from './components/language-selector/language-selector.component';
import {LoadingPlugComponent} from './components/loading-plug/loading-plug.component';
import {NotFoundPlugComponent} from './components/not-found-plug/not-found-plug.component';

@NgModule({
  declarations: [
    AppComponent,
    BrevetArchiveComponent,
    BrevetEditComponent,
    BrevetInfoComponent,
    BrevetListComponent,
    BrevetListItemComponent,
    CheckpointListItemComponent,
    LanguageSelectorComponent,
    LoadingPlugComponent,
    NotFoundPlugComponent,
    DateTimePickerComponent,
  ],
  imports: [
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule.enablePersistence({synchronizeTabs: true}),
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatNativeDateModule,
    MatSelectModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
