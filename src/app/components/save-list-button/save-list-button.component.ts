import {Component} from '@angular/core';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-save-list-button',
  template: `
    <button mat-raised-button *ngIf="auth.isLoggedIn">
      <mat-icon>save</mat-icon>
      Сохранить
    </button>`,
  styleUrls: ['./save-list-button.component.scss']
})
export class SaveListButtonComponent {
  constructor(public auth: AuthService) {
  }
}
