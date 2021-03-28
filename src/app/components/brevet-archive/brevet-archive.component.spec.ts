import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {BrevetArchiveComponent} from './brevet-archive.component';

describe('BrevetArchiveComponent', () => {
  let component: BrevetArchiveComponent;
  let fixture: ComponentFixture<BrevetArchiveComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BrevetArchiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrevetArchiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
