import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingPlugComponent } from './loading-plug.component';

describe('LoadingPlugComponent', () => {
  let component: LoadingPlugComponent;
  let fixture: ComponentFixture<LoadingPlugComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoadingPlugComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadingPlugComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
