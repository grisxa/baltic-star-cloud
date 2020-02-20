import {Component, EventEmitter, forwardRef, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, Validators} from '@angular/forms';
import {MatDatepickerInputEvent} from '@angular/material';

@Component({
  selector: 'app-date-time-picker',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DateTimePickerComponent),
    multi: true}],
  templateUrl: './date-time-picker.component.html',
  styleUrls: ['./date-time-picker.component.css']
})

export class DateTimePickerComponent implements OnInit, ControlValueAccessor {
  @Input() value: Date;
  timeControl: FormControl;
  dateControl: FormControl;
  onChange: (value: Date) => {};

  constructor() {
    console.log('= constructor');
  }

  // TODO: fix input height
  ngOnInit() {
    console.log('=init value', this.value);
    this.dateControl = new FormControl(this.value ? this.formatInputDate(this.value) : '', Validators.required);
    this.timeControl = new FormControl(this.value ? this.formatInputTime(this.value) : '', Validators.required);
  }

  writeValue(date: Date) {
    if (this.value && (this.value instanceof Date) && this.value.getTime() === date.getTime()) {
      return;
    }
    this.value = date;
    // console.log('= write date', typeof date, date);
    this.dateControl.setValue(this.formatInputDate(date));
    this.timeControl.setValue(this.formatInputTime(date));
    if (typeof this.onChange === 'function') {
      this.onChange(this.value);
    }
  }
  registerOnChange(fn) {
    console.log('= register picker onChange', fn);
    this.onChange = fn;
  }
  registerOnTouched(fn) {
    // console.log('= register on touch');
  }

  formatInputTime(date: Date) {
    // console.log('= format time', date);
    if (!date) {
      return '';
    }

    const hours = '0' + date.getHours();
    const minutes = '0' + date.getMinutes();
    // console.log(`= format to ${hours}:${minutes}`);
    return hours.slice(-2) + ':' + minutes.slice(-2);
  }

  formatInputDate(date: Date) {
    // console.log('= format date', date);
    if (!date) {
      return '';
    }
    console.log('=sec', date.getTime() / 1000);
    return date.toISOString();
/*
    const day = '0' + date.getDate();
    const month = '0' + date.getMinutes();
    const year = date.getFullYear();
    // console.log(`= format to ${year}-${month}-${day}`);
    return year + '-' + month.slice(-2) + '-' + day.slice(-2);
*/
  }

  setDate(event?: MatDatepickerInputEvent<unknown>) {
    console.log('= set date', this.dateControl.value);
    if (this.dateControl.valid) {
      console.log('= date valid', this.dateControl.value, this.value);
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
