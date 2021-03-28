import {ComponentFixture, fakeAsync, TestBed, tick, waitForAsync} from '@angular/core/testing';
import {Component, EmbeddedViewRef, TemplateRef, ViewChild} from '@angular/core';

import {EditableComponent} from './editable.component';
import {ViewModeDirective} from '../../directives/view-mode.directive';
import {EditModeDirective} from '../../directives/edit-mode.directive';

@Component({
  selector: 'app-test-component',
  template: `
    <app-editable></app-editable>`,
})
export class TestComponent {
  @ViewChild(EditableComponent) editableComponent?: EditableComponent;
}

describe('EditableComponent modes', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

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
    fixture.detectChanges();
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a sub-component', () => {
    expect(component.editableComponent).not.toBeNull();
  });

  it('should have a null template if markup is empty', () => {
    expect(component.editableComponent?.currentView).toBeNull();
  });

  it(`should take edit template if it exists and mode matches`, fakeAsync(() => {
    const viewTemplate = {elementRef: null} as unknown as TemplateRef<HTMLElement>;
    const editTemplate = {
      elementRef: null,
      createEmbeddedView: (context: HTMLElement): EmbeddedViewRef<HTMLElement>|null => null
    } as unknown as TemplateRef<HTMLElement>;
    if (component.editableComponent) {
      component.editableComponent.viewModeTemplate = new ViewModeDirective(viewTemplate);
      component.editableComponent.editModeTemplate = new ViewModeDirective(editTemplate);
    }
    component.editableComponent?.editMode.next(true);
    tick(1);
    expect(component.editableComponent?.currentView).toEqual(editTemplate);
  }));

  it(`should take view mode template if edit doesn't exists`, fakeAsync(() => {
    const template = {elementRef: null} as unknown as TemplateRef<HTMLElement>;
    if (component.editableComponent) {
      component.editableComponent.viewModeTemplate = new ViewModeDirective(template);
    }
    component.editableComponent?.editMode.next(true);
    tick(1);
    expect(component.editableComponent?.currentView).toEqual(template);
  }));

  it(`should explicitly take view template if mode matches`, fakeAsync(() => {
    const viewTemplate = {elementRef: null} as unknown as TemplateRef<HTMLElement>;
    const editTemplate = {
      elementRef: null,
      createEmbeddedView: (context: HTMLElement): EmbeddedViewRef<HTMLElement>|null => null
    } as unknown as TemplateRef<HTMLElement>;
    if (component.editableComponent) {
      component.editableComponent.viewModeTemplate = new ViewModeDirective(viewTemplate);
      component.editableComponent.editModeTemplate = new ViewModeDirective(editTemplate);
    }
    component.editableComponent?.editMode.next(false);
    tick(1);
    expect(component.editableComponent?.currentView).toEqual(viewTemplate);
  }));
});
