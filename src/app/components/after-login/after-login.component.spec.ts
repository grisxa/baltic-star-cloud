import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {AfterLoginComponent} from './after-login.component';
import {RouterTestingModule} from '@angular/router/testing';
import {AuthService} from '../../services/auth.service';
import {StorageService} from '../../services/storage.service';
import {Subject} from 'rxjs';
import {Rider} from '../../models/rider';

class MockAuthService {
  user$ = new Subject<Rider | null>();
}

class MockStorageService {
}

class MockRoute {

}

describe('AfterLoginComponent', () => {
  let component: AfterLoginComponent;
  let fixture: ComponentFixture<AfterLoginComponent>;
  let mockAuth: MockAuthService;

  beforeAll(() => {
    mockAuth = new MockAuthService();
  });
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(
        [{path: 'brevets', component: MockRoute}]
      )],
      providers: [
        {provide: AuthService, useValue: mockAuth},
        {provide: StorageService, useClass: MockStorageService},
      ],
      declarations: [AfterLoginComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AfterLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    mockAuth.user$.next(new Rider('1', '2', '3'));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
