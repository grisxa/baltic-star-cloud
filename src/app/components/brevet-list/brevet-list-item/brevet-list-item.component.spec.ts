import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {BrevetListItemComponent} from './brevet-list-item.component';
import {AuthService} from '../../../services/auth.service';
import {StorageService} from '../../../services/storage.service';
import {MatSnackBarModule} from '@angular/material/snack-bar';

class MockAuthService {
}

class MockStorageService {
}

describe('BrevetListItemComponent', () => {
  let component: BrevetListItemComponent;
  let fixture: ComponentFixture<BrevetListItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatSnackBarModule],
      providers: [
        {provide: AuthService, useClass: MockAuthService},
        {provide: StorageService, useClass: MockStorageService},
      ],
      declarations: [BrevetListItemComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrevetListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
