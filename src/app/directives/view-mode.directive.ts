import {Directive, TemplateRef} from '@angular/core';

@Directive({
  selector: '[appViewMode]'
})
export class ViewModeDirective {

  constructor(public template: TemplateRef<any>) {
  }

}
