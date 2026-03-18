import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeExpenseStatement } from './employee-expense-statement';

describe('EmployeeExpenseStatement', () => {
  let component: EmployeeExpenseStatement;
  let fixture: ComponentFixture<EmployeeExpenseStatement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeExpenseStatement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeExpenseStatement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
