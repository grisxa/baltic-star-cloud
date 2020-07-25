import {Component} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {FirebaseUISignInFailure} from 'firebaseui-angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  constructor(private snackBar: MatSnackBar) { }

  onError(event: FirebaseUISignInFailure) {
    console.error('= login error', event);
    if (!(event instanceof TypeError)) {
      this.snackBar.open(`Ошибка входа. ${event.code}`,
        'Закрыть', {duration: 5000});
    }
  }
}
