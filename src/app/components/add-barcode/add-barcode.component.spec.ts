import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBarcodeComponent } from './add-barcode.component';

xdescribe('AddBarcodeComponent', () => {
  let component: AddBarcodeComponent;
  let fixture: ComponentFixture<AddBarcodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddBarcodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddBarcodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
