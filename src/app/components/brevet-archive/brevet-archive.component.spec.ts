import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatListModule} from '@angular/material/list';
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
});
