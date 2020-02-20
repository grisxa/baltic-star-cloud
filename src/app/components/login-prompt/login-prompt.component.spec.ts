import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {LoginPromptComponent} from './login-prompt.component';
import {MatIconModule} from '@angular/material';
import {AngularFireAuthModule} from '@angular/fire/auth';
import {AngularFireModule} from '@angular/fire';
import {AngularFirestoreModule} from '@angular/fire/firestore';

import {environment} from '../../../environments/environment.test';

describe('LoginPromptComponent', () => {
  let component: LoginPromptComponent;
  let fixture: ComponentFixture<LoginPromptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoginPromptComponent],
      imports: [
        MatIconModule,
        AngularFirestoreModule,
        AngularFireAuthModule,
        AngularFireModule.initializeApp(environment.firebase),
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginPromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
