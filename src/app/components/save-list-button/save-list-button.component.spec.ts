import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {SaveListButtonComponent} from './save-list-button.component';

xdescribe('SaveListButtonComponent', () => {
  let component: SaveListButtonComponent;
  let fixture: ComponentFixture<SaveListButtonComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SaveListButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveListButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
