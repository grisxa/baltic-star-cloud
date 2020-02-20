import {async, ComponentFixture, TestBed} from '@angular/core/testing';
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
  @ViewChild(EditableComponent, null) editableComponent: EditableComponent;
}

describe('Edit mode directive', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let element: HTMLElement;

  beforeEach(async(() => {
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

    component.editableComponent.editMode.next(true);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should init the component', () => {
    expect(component.editableComponent.editMode.getValue).toBeTruthy();
    expect(element.innerText).toEqual('edit mode markup');
  });

});
