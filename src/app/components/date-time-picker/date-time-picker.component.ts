import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, Validators} from '@angular/forms';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';

@Component({
  selector: 'app-date-time-picker',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DateTimePickerComponent),
    multi: true
  }],
  templateUrl: './date-time-picker.component.html',
  styleUrls: ['./date-time-picker.component.scss']
})

export class DateTimePickerComponent implements OnInit, ControlValueAccessor {
  @Input() value?: Date;
  timeControl: FormControl;
  dateControl: FormControl;
  onChange?: (value: Date) => void;

  constructor() {
    this.dateControl = new FormControl('', Validators.required);
    this.timeControl = new FormControl('', Validators.required);
  }

  // TODO: fix input height
  ngOnInit() {
    if (this.value) {
      this.dateControl.setValue(this.formatInputDate(this.value));
      this.timeControl.setValue(this.formatInputTime(this.value));
    }
  }

  writeValue(date: Date) {
    if (this.value && this.value.getTime() === date.getTime()) {
      return;
    }
    this.value = date;
    this.dateControl.setValue(this.formatInputDate(date));
    this.timeControl.setValue(this.formatInputTime(date));
    if (typeof this.onChange === 'function') {
      this.onChange(this.value);
    }
  }

  registerOnChange(fn: () => void) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void) {
  }

  formatInputTime(date: Date) {
    const hours = '0' + date.getHours();
    const minutes = '0' + date.getMinutes();
    return hours.slice(-2) + ':' + minutes.slice(-2);
  }

  formatInputDate(date: Date) {
    return date.toISOString();
  }

  setDate(event: MatDatepickerInputEvent<unknown>) {
    if (this.dateControl.valid) {
      const date = this.value ? new Date(this.value) : new Date();
      date.setDate(this.dateControl.value.getDate());
      date.setMonth(this.dateControl.value.getMonth());
      date.setFullYear(this.dateControl.value.getFullYear());
      this.writeValue(date);
    }

  }

  // TODO: check focus in MS Edge
  setTime(event: Event) {
    event.stopPropagation();
    if (this.timeControl.valid) {
      const date = this.value ? new Date(this.value) : new Date();
      // split time input of HH:mm
      const [hours, mins]: number[] = this.timeControl.value
        .split(':').map((v: string) => parseInt(v, 10));
      date.setHours(hours, mins, 0, 0);
      this.writeValue(date);
    }
  }
}
