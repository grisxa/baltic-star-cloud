import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {CheckpointSearchDialogComponent} from './checkpoint-search-dialog.component';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {MatRadioModule} from '@angular/material/radio';

describe('CheckpointSearchDialogComponent', () => {
  let component: CheckpointSearchDialogComponent;
  let fixture: ComponentFixture<CheckpointSearchDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        MatRadioModule,
      ],
      providers: [
        {provide: MAT_DIALOG_DATA, useValue: {}}
      ],
      declarations: [CheckpointSearchDialogComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckpointSearchDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
