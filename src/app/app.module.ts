import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatSelectModule} from '@angular/material/select';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrevetListItemComponent} from './components/brevet-list/brevet-list-item/brevet-list-item.component';
import {BrevetListComponent} from './components/brevet-list/brevet-list.component';
import {LanguageSelectorComponent} from './components/language-selector/language-selector.component';

@NgModule({
  declarations: [
    AppComponent,
    BrevetListComponent,
    BrevetListItemComponent,
    LanguageSelectorComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
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
