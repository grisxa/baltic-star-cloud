import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {BrevetInfoComponent} from './components/brevet-info/brevet-info.component';

import {BrevetListComponent} from './components/brevet-list/brevet-list.component';

const routes: Routes = [
  {path: '', redirectTo: 'brevets', pathMatch: 'full'},
  {path: 'brevet', component: BrevetListComponent},
  {path: 'brevets', component: BrevetListComponent},
  {path: 'brevet/:uid', component: BrevetInfoComponent},
  {path: '**', redirectTo: 'brevets'},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
