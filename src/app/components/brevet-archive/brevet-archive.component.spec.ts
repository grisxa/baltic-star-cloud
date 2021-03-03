import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrevetArchiveComponent } from './brevet-archive.component';

describe('BrevetArchiveComponent', () => {
  let component: BrevetArchiveComponent;
  let fixture: ComponentFixture<BrevetArchiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrevetArchiveComponent ]
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
});
