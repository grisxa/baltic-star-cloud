import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {Component, ViewChild} from '@angular/core';

import {ViewModeDirective} from './view-mode.directive';
import {EditableComponent} from '../components/editable/editable.component';
import {EditModeDirective} from './edit-mode.directive';

@Component({
  template: `
    <app-editable>
      <ng-template appViewMode>view mode markup</ng-template>
      <ng-template appEditMode>edit mode markup</ng-template>
    </app-editable>`,
})

export class TestComponent {
  @ViewChild(EditableComponent) editableComponent?: EditableComponent;
}

describe('View mode directive', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let element: HTMLElement;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestComponent,
        EditableComponent,
        ViewModeDirective,
        EditModeDirective
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    element = fixture.debugElement.nativeElement;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should init the component', () => {
    expect(component.editableComponent?.editMode.getValue()).toBeFalsy();
    expect(element.innerText).toEqual('view mode markup');
  });

});
