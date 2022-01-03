import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {LoginComponent} from './login.component';
import {RouterTestingModule} from '@angular/router/testing';
import {AuthService} from '../../services/auth.service';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {Subject} from 'rxjs';
import {Rider} from '../../models/rider';
import firebase from 'firebase/compat/app';
import {environment} from '../../../environments/environment.test';

class MockAuthService {
  user$ = new Subject<Rider | null>();
}

class Mock {

}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuth: MockAuthService;
  let auth;

  beforeAll(waitForAsync( () => {
    firebase.initializeApp(environment.firebase);
    auth = firebase.auth();
    auth.useEmulator("http://localhost:9099");

    mockAuth = new MockAuthService();
  }));

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatSnackBarModule,
        RouterTestingModule.withRoutes(
        [{path: 'after-login', component: Mock}]
        ),
      ],
      providers: [
        {provide: AuthService, useValue: mockAuth},
      ],
      declarations: [LoginComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    mockAuth.user$.next(new Rider('1', '2', '3'));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
