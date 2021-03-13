import {NgModule} from '@angular/core';
import {AngularFireModule} from '@angular/fire';
import {AngularFirestoreModule} from '@angular/fire/firestore';
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
import {BrevetListItemComponent} from './components/brevet-list/brevet-list-item/brevet-list-item.component';
import {BrevetListComponent} from './components/brevet-list/brevet-list.component';
import {LanguageSelectorComponent} from './components/language-selector/language-selector.component';
import {LoadingPlugComponent} from './components/loading-plug/loading-plug.component';
import {NotFoundPlugComponent} from './components/not-found-plug/not-found-plug.component';

@NgModule({
  declarations: [
    AppComponent,
    BrevetArchiveComponent,
    BrevetListComponent,
    BrevetListItemComponent,
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
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
