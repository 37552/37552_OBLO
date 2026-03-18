import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeePerformance } from './employee-performance';

describe('EmployeePerformance', () => {
  let component: EmployeePerformance;
  let fixture: ComponentFixture<EmployeePerformance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeePerformance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeePerformance);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
