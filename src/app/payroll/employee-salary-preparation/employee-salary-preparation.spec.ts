import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeSalaryPreparation } from './employee-salary-preparation';

describe('EmployeeSalaryPreparation', () => {
  let component: EmployeeSalaryPreparation;
  let fixture: ComponentFixture<EmployeeSalaryPreparation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeSalaryPreparation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeSalaryPreparation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
