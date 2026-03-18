import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeCalendar } from './employee-calendar';

describe('EmployeeCalendar', () => {
  let component: EmployeeCalendar;
  let fixture: ComponentFixture<EmployeeCalendar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeCalendar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeCalendar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
