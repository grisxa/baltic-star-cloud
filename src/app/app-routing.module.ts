import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {BrevetEditComponent} from './components/brevet-edit/brevet-edit.component';
import {BrevetInfoComponent} from './components/brevet-info/brevet-info.component';

import {BrevetListComponent} from './components/brevet-list/brevet-list.component';

const routes: Routes = [
  {path: '', redirectTo: 'brevets', pathMatch: 'full'},
  {path: 'brevet', component: BrevetListComponent},
  {path: 'brevets', component: BrevetListComponent},
  {path: 'brevet/:uid', component: BrevetInfoComponent},
  {path: 'brevet/:uid/edit', component: BrevetEditComponent},
  {path: '**', redirectTo: 'brevets'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {enableTracing: false})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
