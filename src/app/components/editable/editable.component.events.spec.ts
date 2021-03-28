import {ComponentFixture, fakeAsync, TestBed, tick, waitForAsync} from '@angular/core/testing';
import {Component, ViewChild} from '@angular/core';
import {EditableComponent} from './editable.component';
import {ViewModeDirective} from '../../directives/view-mode.directive';
import {EditModeDirective} from '../../directives/edit-mode.directive';

@Component({
  template: `
    <app-editable>
      <ng-template appViewMode>view mode markup</ng-template>
      <ng-template appEditMode>edit mode markup<input #value/></ng-template>
    </app-editable>`,
})

export class TestComponent {
  @ViewChild(EditableComponent) editableComponent?: EditableComponent;
}

describe('EditableComponent events', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let element: HTMLElement;
  let input: HTMLInputElement | null;

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
    input = element.querySelector('input');

    component.editableComponent?.editMode.next(false);
    fixture.detectChanges();
  });
  beforeAll(() => {
    // @ts-ignore
    spyOn(document, 'onclick').and.callThrough();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should catch a click in view mode and switch to edit', fakeAsync(() => {
    spyOn(component.editableComponent?.host.nativeElement, 'onclick').and.callThrough();

    component.editableComponent?.host.nativeElement.click();
    tick(1);
    expect(component.editableComponent?.host.nativeElement.onclick).toHaveBeenCalled();
    expect(component.editableComponent?.editMode.getValue()).toBeTruthy();
  }));

  it('should catch a click in edit mode and ignore', fakeAsync(() => {
    component.editableComponent?.editMode.next(true);
    spyOn(component.editableComponent?.host.nativeElement, 'onclick').and.callThrough();

    component.editableComponent?.host.nativeElement.click();
    tick(1);
    expect(component.editableComponent?.host.nativeElement.onclick).toHaveBeenCalled();
    expect(component.editableComponent?.editMode.getValue()).toBeTruthy();
  }));

  it('should catch a click out in edit mode and switch to view', fakeAsync(() => {
    component.editableComponent?.editMode.next(true);

    document.dispatchEvent(new MouseEvent('click'));
    tick(1);

    expect(document.onclick).toHaveBeenCalled();
    expect(component.editableComponent?.editMode.getValue()).toBeFalsy();
  }));

  it('should catch an Enter key up in edit mode and switch to view and update content', fakeAsync(() => {
    component.editableComponent?.editMode.next(true);

    spyOn(component.editableComponent?.host.nativeElement, 'onkeyup').and.callThrough();

    let content = 'original';
    component.editableComponent?.update.subscribe(() => {
      content = 'changed';
    });

    component.editableComponent?.host.nativeElement
      .dispatchEvent(new KeyboardEvent('keyup', {key: 'Enter'}));
    tick(1);

    expect(component.editableComponent?.host.nativeElement.onkeyup).toHaveBeenCalled();
    expect(content).toEqual('changed');
    expect(component.editableComponent?.editMode.getValue()).toBeFalsy();
  }));

  it('should catch an Escape key up in edit mode and switch to view but leave content unchanged', fakeAsync(() => {
    component.editableComponent?.editMode.next(true);

    spyOn(component.editableComponent?.host.nativeElement, 'onkeyup').and.callThrough();

    let content = 'original';
    component.editableComponent?.update.subscribe(() => {
      content = 'changed';
    });

    component.editableComponent?.host.nativeElement
      .dispatchEvent(new KeyboardEvent('keyup', {key: 'Escape'}));
    tick(1);

    expect(component.editableComponent?.host.nativeElement.onkeyup).toHaveBeenCalled();
    expect(content).toEqual('original');
    expect(component.editableComponent?.editMode.getValue()).toBeFalsy();
  }));

  it('should ignore other keys than Enter or Escape', fakeAsync(() => {
    component.editableComponent?.editMode.next(true);

    spyOn(component.editableComponent?.host.nativeElement, 'onkeyup').and.callThrough();

    component.editableComponent?.host.nativeElement
      .dispatchEvent(new KeyboardEvent('keyup', {key: 'Z'}));
    tick(1);

    expect(component.editableComponent?.host.nativeElement.onkeyup).toHaveBeenCalled();
    expect(component.editableComponent?.editMode.getValue()).toBeTruthy();
  }));

  it('should ignore keys in view mode', fakeAsync(() => {
    spyOn(component.editableComponent?.host.nativeElement, 'onkeyup').and.callThrough();

    component.editableComponent?.host.nativeElement
      .dispatchEvent(new KeyboardEvent('keyup', {key: 'Enter'}));
    tick(1);

    expect(component.editableComponent?.host.nativeElement.onkeyup).toHaveBeenCalled();
    expect(component.editableComponent?.editMode.getValue()).toBeFalsy();
  }));

  it('should focus the first input element', fakeAsync(() => {
    if (input) {
      spyOn(input, 'focus').and.callThrough();
      component.editableComponent?.editMode.next(true);
      tick(1);

      expect(input.focus).toHaveBeenCalled();
    }
  }));
});
