import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddBarcodeComponent } from './add-barcode.component';

xdescribe('AddBarcodeComponent', () => {
  let component: AddBarcodeComponent;
  let fixture: ComponentFixture<AddBarcodeComponent>;

  beforeEach(waitForAsync(() => {
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
