import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {LoginPromptComponent} from './login-prompt.component';
import {MatIconModule} from '@angular/material/icon';
import {AuthService} from '../../services/auth.service';
import {Subject} from 'rxjs';
import {Rider} from '../../models/rider';
import firebase from 'firebase/compat/app';
import {environment} from '../../../environments/environment.test';

class MockAuthService {
  user$ = new Subject<Rider | null>();
}

describe('LoginPromptComponent', () => {
  let component: LoginPromptComponent;
  let fixture: ComponentFixture<LoginPromptComponent>;
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
      declarations: [LoginPromptComponent],
      providers: [
        {provide: AuthService, useValue: mockAuth},
      ],
      imports: [
        MatIconModule,
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginPromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    mockAuth.user$.next(new Rider('1', '2', '3'));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
