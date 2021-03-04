import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatListModule} from '@angular/material/list';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

import {BrevetArchiveComponent} from './brevet-archive.component';

describe('BrevetArchiveComponent', () => {
  let component: BrevetArchiveComponent;
  let fixture: ComponentFixture<BrevetArchiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BrevetArchiveComponent],
      imports: [
        MatExpansionModule,
        MatListModule,
        NoopAnimationsModule,
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BrevetArchiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a closed list by default', () => {
    const panel = fixture.debugElement
      .query(By.css('.mat-expansion-panel-header-description'));
    expect(panel.nativeElement.innerText).toEqual('Expand');
  });

  it('should allow collapsing after opening', () => {
    component.panelOpenState = true;
    fixture.detectChanges();
    const panel = fixture.debugElement
      .query(By.css('.mat-expansion-panel-header-description'));
    expect(panel.nativeElement.innerText).toEqual('Collapse');
  });

});
