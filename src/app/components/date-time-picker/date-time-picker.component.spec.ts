import {Component, DebugElement, OnInit, ViewChild} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatNativeDateModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

import {DateTimePickerComponent} from './date-time-picker.component';

@Component({
  template: `
    <app-date-time-picker
      [formControl]="dateControl"
      [value]="date">
    </app-date-time-picker>`
})

export class TestComponent implements OnInit {
  @ViewChild(DateTimePickerComponent, null) dateTimePickerComponent: DateTimePickerComponent;
  dateControl: FormControl;

  constructor(public date?: Date) {
  }

  ngOnInit() {
    this.dateControl = new FormControl(this.date, Validators.required);
  }
}


describe('DateTimePickerComponent', () => {
  let component: DateTimePickerComponent;
  let fixture: ComponentFixture<DateTimePickerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DateTimePickerComponent],
      imports: [
        ReactiveFormsModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        NoopAnimationsModule,
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DateTimePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Date formatter', () => {
    it('should return empty string by default', () => {
      expect(component.formatInputDate(null)).toEqual('');
    });

    it('should return an ISO string for the date', () => {
      const date = new Date();
      date.setTime(1000000000000);
      expect(component.formatInputDate(date)).toEqual('2001-09-09T01:46:40.000Z');
    });
  });

  describe('Time formatter', () => {
    it('should return empty string by default', () => {
      expect(component.formatInputTime(null)).toEqual('');
    });

    it('should return hour:minutes', () => {
      const date = new Date();
      date.setTime(1000000000000);
      // remove timezone shift
      date.setTime(1000000000000 + date.getTimezoneOffset() * 60000);
      // '2001-09-09T01:46:40.000Z'
      expect(component.formatInputTime(date)).toEqual('01:46');
    });

  });


});

describe('DateTimePickerComponent usage', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestComponent,
        DateTimePickerComponent
      ],
      imports: [
        ReactiveFormsModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        NoopAnimationsModule,
      ],
      // FIXME
      providers: [ {provide: Date, useValue: new Date(1609448400000)}],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  xit('should register a change callback', () => {
    spyOn(component.dateTimePickerComponent, 'registerOnChange');
    fixture.detectChanges();
    expect(component.dateTimePickerComponent.registerOnChange).toHaveBeenCalled();
  });

  describe('time field', () => {
    it('change should emit setting', () => {
      spyOn(component.dateTimePickerComponent, 'setTime');
      const timeInput: DebugElement = fixture.debugElement.query(By.css('#time'));
      timeInput.nativeElement.dispatchEvent(new Event('change'));
      expect(component.dateTimePickerComponent.setTime).toHaveBeenCalled();
    });
  });

  describe('date field', () => {
    it('change should emit setting', () => {
      spyOn(component.dateTimePickerComponent, 'setDate');
      const dateInput: DebugElement = fixture.debugElement.query(By.css('#date'));
      dateInput.nativeElement.dispatchEvent(new Event('change'));
      expect(component.dateTimePickerComponent.setDate).toHaveBeenCalled();
    });
  });
});
