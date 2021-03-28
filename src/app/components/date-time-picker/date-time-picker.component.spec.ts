import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {DateTimePickerComponent} from './date-time-picker.component';
import {MatNativeDateModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {Component, DebugElement, ViewChild} from '@angular/core';
import {By} from '@angular/platform-browser';

@Component({
  template: `
    <app-date-time-picker
      [formControl]="dateControl"
      [value]="date">
    </app-date-time-picker>`
})

export class TestComponent {
  @ViewChild(DateTimePickerComponent) dateTimePickerComponent?: DateTimePickerComponent;
  dateControl: FormControl;

  // date: Date;

  constructor(public date?: Date) {
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
        MatNativeDateModule
      ]
    })
      .compileComponents();
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
    it('should return an ISO string for the date', () => {
      const date = new Date();
      date.setTime(1000000000000);
      expect(component.formatInputDate(date)).toEqual('2001-09-09T01:46:40.000Z');
    });
  });

  describe('Time formatter', () => {
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
        MatNativeDateModule
      ],
      // FIXME
      providers: [{provide: Date, useValue: new Date()}],
      // schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should register a change callback', () => {
    if (component.dateTimePickerComponent) {
      spyOn(component.dateTimePickerComponent, 'registerOnChange');
      fixture.detectChanges();
      expect(component.dateTimePickerComponent?.registerOnChange).toHaveBeenCalled();
    }
  });

  describe('time field', () => {
    it('change should emit setting', () => {
      if (component.dateTimePickerComponent) {
        spyOn(component.dateTimePickerComponent, 'setTime');
        const timeInput: DebugElement = fixture.debugElement.query(By.css('#time'));
        timeInput.nativeElement.dispatchEvent(new Event('change'));
        expect(component.dateTimePickerComponent?.setTime).toHaveBeenCalled();
      }
    });
  });

  describe('date field', () => {
    it('change should emit setting', () => {
      if (component.dateTimePickerComponent) {
        spyOn(component.dateTimePickerComponent, 'setDate');
        const dateInput: DebugElement = fixture.debugElement.query(By.css('#date'));
        dateInput.nativeElement.dispatchEvent(new Event('change'));
        expect(component.dateTimePickerComponent?.setDate).toHaveBeenCalled();
      }
    });
  });
});
