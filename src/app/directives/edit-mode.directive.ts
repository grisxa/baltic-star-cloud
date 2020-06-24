import {Directive, OnChanges, SimpleChanges, TemplateRef} from '@angular/core';

@Directive({
  selector: '[appEditMode]'
})
export class EditModeDirective {

  constructor(public template: TemplateRef<any>) {
  }
}
