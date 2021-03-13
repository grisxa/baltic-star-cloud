import {ComponentFixture, TestBed} from '@angular/core/testing';

import {NotFoundPlugComponent} from './not-found-plug.component';

describe('NotFoundPlugComponent', () => {
  let component: NotFoundPlugComponent;
  let fixture: ComponentFixture<NotFoundPlugComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotFoundPlugComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotFoundPlugComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should say Not found', () => {
    expect(fixture.nativeElement.innerText).toEqual('Not found');
  });
});
