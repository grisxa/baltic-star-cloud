import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {CheckpointListItemComponent} from './checkpoint-list-item.component';
import {AuthService} from '../../../services/auth.service';
import {StorageService} from '../../../services/storage.service';
import {MatSnackBarModule} from '@angular/material/snack-bar';

class MockAuthService {
}

class MockStorageService {
}

describe('CheckpointListItemComponent', () => {
  let component: CheckpointListItemComponent;
  let fixture: ComponentFixture<CheckpointListItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatSnackBarModule],
      providers: [
        {provide: AuthService, useClass: MockAuthService},
        {provide: StorageService, useClass: MockStorageService},
      ],
      declarations: [CheckpointListItemComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckpointListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
