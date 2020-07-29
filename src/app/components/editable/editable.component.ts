import {
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef
} from '@angular/core';
import {ViewModeDirective} from '../../directives/view-mode.directive';
import {EditModeDirective} from '../../directives/edit-mode.directive';
import {BehaviorSubject, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';


@Component({
  selector: 'app-editable',
  template: `
    <ng-container *ngTemplateOutlet="currentView"></ng-container>`,
  styleUrls: ['./editable.component.scss']
})
export class EditableComponent implements  OnInit, OnDestroy {
  @Output() update = new EventEmitter<boolean>();
  @ContentChild(ViewModeDirective, {static: true}) viewModeTemplate: ViewModeDirective;
  @ContentChild(EditModeDirective, {static: false}) editModeTemplate: EditModeDirective;

  unsubscribe$ = new Subject();
  editMode = new BehaviorSubject<boolean>(false);
  currentView: TemplateRef<any>;

  constructor(public host: ElementRef, private changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.currentView = this.viewModeTemplate ? this.viewModeTemplate.template : null;
    this.editMode.pipe(takeUntil(this.unsubscribe$))
      .subscribe((switchToEdit: boolean) => {
        if (!switchToEdit || this.editModeTemplate === undefined) {
          this.currentView = this.viewModeTemplate ? this.viewModeTemplate.template : null;
        } else {
          this.currentView = this.editModeTemplate.template;
          try {
            this.changeDetectorRef.detectChanges();
          } catch (error) {
            console.warn('change detection has failed', error.message);
          }

          // auto-focusing
          const element: HTMLElement = this.host.nativeElement.querySelector('input:not(:focus)');
          if (element) {
            element.focus();
          }
        }
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
  }

  /**
   * Global (outside) click handler to switch edit mode off
   * @param event - Detect target here
   */
  @HostListener('document:click', ['$event'])
  public documentClick(event: MouseEvent) {
    // FIXME: fire on mouse button up not down
    const target = event.composedPath();

    if (this.editMode.getValue() === true &&
      !target.includes(this.host.nativeElement) &&
      !target.map((item: HTMLElement) => item.tagName).includes('MAT-DATEPICKER-CONTENT')) {

      this.editMode.next(false);
      this.update.next(true);
    }
  }

  // TODO: (?) make component focusable with Tab key

  /**
   * Private component click handler to switch edit mode on
   */
  @HostListener('click', ['$event'])
  public hostClick(event: MouseEvent) {
    const target = event.composedPath();

    if (this.editMode.getValue() === false) {
      this.editMode.next(true);
    }
  }

  @HostListener('keyup', ['$event'])
  public hostKeyUp(event: KeyboardEvent) {
    const target = event.composedPath();

    if (this.editMode.getValue() === true) {
      if (event.key === 'Enter') {
        this.update.next(true);
      } else if (event.key !== 'Escape') {
        return;
      }

      this.editMode.next(false);
    }
  }
}
