import {Component} from '@angular/core';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-add-button',
  template: `
    <button mat-raised-button *ngIf="auth.isLoggedIn">
      <mat-icon>add</mat-icon>
      Добавить
    </button>`,
  styleUrls: ['./add-button.component.css']
})
export class AddButtonComponent {
  constructor(public auth: AuthService) {
  }
}
