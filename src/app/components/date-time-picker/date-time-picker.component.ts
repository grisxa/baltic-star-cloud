import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, Validators} from '@angular/forms';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';

@Component({
  selector: 'app-date-time-picker',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DateTimePickerComponent),
    multi: true}],
  templateUrl: './date-time-picker.component.html',
  styleUrls: ['./date-time-picker.component.scss']
})

export class DateTimePickerComponent implements OnInit, ControlValueAccessor {
  @Input() value: Date;
  timeControl: FormControl;
  dateControl: FormControl;
  onChange: (value: Date) => void;

  // TODO: fix input height
  ngOnInit() {
    this.dateControl = new FormControl(this.value ? this.formatInputDate(this.value) : '', Validators.required);
    this.timeControl = new FormControl(this.value ? this.formatInputTime(this.value) : '', Validators.required);
  }

  writeValue(date: Date) {
    if (this.value && (this.value instanceof Date) && this.value.getTime() === date.getTime()) {
      return;
    }
    this.value = date;
    this.dateControl.setValue(this.formatInputDate(date));
    this.timeControl.setValue(this.formatInputTime(date));
    if (typeof this.onChange === 'function') {
      this.onChange(this.value);
    }
  }
  registerOnChange(fn) {
    this.onChange = fn;
  }
  registerOnTouched(fn) {
    // console.log('= register on touch');
  }

  formatInputTime(date: Date) {
    if (!date) {
      return '';
    }

    const hours = '0' + date.getHours();
    const minutes = '0' + date.getMinutes();
    return hours.slice(-2) + ':' + minutes.slice(-2);
  }

  formatInputDate(date: Date) {
    // console.log('= format date', date);
    if (!date) {
      return '';
    }
    return date.toISOString();
  }

  setDate(event?: MatDatepickerInputEvent<unknown>) {
    if (this.dateControl.valid) {
      const date = new Date(this.value);
      date.setDate(this.dateControl.value.getDate());
      date.setMonth(this.dateControl.value.getMonth());
      date.setFullYear(this.dateControl.value.getFullYear());
      this.writeValue(date);
    }

  }
  // TODO: check focus in MS Edge
  setTime(event?: Event) {
    event.stopPropagation();
    if (this.timeControl.valid) {
      const date = new Date(this.value);
      // split time input of HH:mm
      const [hours, mins]: number[] = this.timeControl.value.split(':').map(v => parseInt(v, 10));
      date.setHours(hours, mins, 0, 0);
      this.writeValue(date);
    }
  }
}
