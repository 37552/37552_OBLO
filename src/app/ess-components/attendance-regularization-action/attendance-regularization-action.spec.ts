import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceRegularizationAction } from './attendance-regularization-action';

describe('AttendanceRegularizationAction', () => {
  let component: AttendanceRegularizationAction;
  let fixture: ComponentFixture<AttendanceRegularizationAction>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendanceRegularizationAction]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceRegularizationAction);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
