import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatListModule} from '@angular/material/list';
import {By} from '@angular/platform-browser';
import {RouterTestingModule} from '@angular/router/testing';
import {Checkpoint} from '../../../models/checkpoint';
import {Waypoint} from '../../../models/waypoint';

import {CheckpointListItemComponent} from './checkpoint-list-item.component';

describe('CheckpointListItemComponent', () => {
  let component: CheckpointListItemComponent;
  let fixture: ComponentFixture<CheckpointListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CheckpointListItemComponent],
      imports: [
        MatListModule,
        RouterTestingModule,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckpointListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a checkpoint record', () => {
    component.checkpoint = new Checkpoint({name: 'test', distance: 1} as Waypoint);
    fixture.detectChanges();
    const link = fixture.debugElement
      .query(By.css('mat-list-item'));
    expect(link.nativeElement.innerText).toEqual('test, 1 km');
  });
});
