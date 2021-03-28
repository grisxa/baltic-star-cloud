import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AppComponent} from './app.component';
import {Component} from '@angular/core';
import {RouterTestingModule} from '@angular/router/testing';
import {MatIconModule} from '@angular/material/icon';

// eslint-disable-next-line @angular-eslint/component-selector
@Component({selector: 'router-outlet', template: ''})
class RouterOutletStubComponent {
}

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatIconModule,
        RouterTestingModule
      ],
      declarations: [
        AppComponent,
        RouterOutletStubComponent
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(AppComponent);
  });

  it('should create the app', () => {
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have a home icon', () => {
    const element = fixture.debugElement.nativeElement;
    expect(element.innerText).toContain('home');
  });
});
