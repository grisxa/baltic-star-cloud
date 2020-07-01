import {Component} from '@angular/core';
import {AuthProvider} from 'ngx-auth-firebaseui';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  providers = AuthProvider;

  constructor(private snackBar: MatSnackBar) { }

  onError(event) {
    console.error('= login error', event);
    if (!(event instanceof TypeError)) {
      this.snackBar.open(`Ошибка входа. ${event.message}`,
        'Закрыть', {duration: 5000});
    }
  }
}
