import {NgModule} from '@angular/core';
import {AngularFireModule} from '@angular/fire';
import {USE_EMULATOR as USE_AUTH_EMULATOR} from '@angular/fire/auth';
import {AngularFirestoreModule, USE_EMULATOR as USE_FIRESTORE_EMULATOR} from '@angular/fire/firestore';
import {FormsModule} from '@angular/forms';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatSelectModule} from '@angular/material/select';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ServiceWorkerModule} from '@angular/service-worker';

import {environment} from '../environments/environment';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrevetArchiveComponent} from './components/brevet-archive/brevet-archive.component';
import {BrevetInfoComponent} from './components/brevet-info/brevet-info.component';
import {CheckpointListItemComponent} from './components/brevet-info/checkpoint-list-item/checkpoint-list-item.component';
import {BrevetListItemComponent} from './components/brevet-list/brevet-list-item/brevet-list-item.component';
import {BrevetListComponent} from './components/brevet-list/brevet-list.component';
import {LanguageSelectorComponent} from './components/language-selector/language-selector.component';
import {LoadingPlugComponent} from './components/loading-plug/loading-plug.component';
import {NotFoundPlugComponent} from './components/not-found-plug/not-found-plug.component';

@NgModule({
  declarations: [
    AppComponent,
    BrevetArchiveComponent,
    BrevetInfoComponent,
    BrevetListComponent,
    BrevetListItemComponent,
    CheckpointListItemComponent,
    LanguageSelectorComponent,
    LoadingPlugComponent,
    NotFoundPlugComponent,
  ],
  imports: [
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule.enablePersistence({synchronizeTabs: true}),
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    MatExpansionModule,
    MatIconModule,
    MatListModule,
    MatSelectModule,
    ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production})
  ],
  providers: [
    {
      provide: USE_FIRESTORE_EMULATOR,
      useValue: environment.useEmulators ? ['localhost', 8080] : undefined
    },
    {
      provide: USE_AUTH_EMULATOR,
      useValue: environment.useEmulators ? ['localhost', 9099] : undefined
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
