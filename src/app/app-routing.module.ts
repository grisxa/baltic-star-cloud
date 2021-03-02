import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {BrevetListComponent} from './components/brevet-list/brevet-list.component';

const routes: Routes = [
  {path: '', redirectTo: 'brevets', pathMatch: 'full'},
  {path: 'brevet', component: BrevetListComponent},
  {path: 'brevets', component: BrevetListComponent},
  {path: '**', redirectTo: 'brevets'},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
