import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficeExpenseReimbursement } from './office-expense-reimbursement';

describe('OfficeExpenseReimbursement', () => {
  let component: OfficeExpenseReimbursement;
  let fixture: ComponentFixture<OfficeExpenseReimbursement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfficeExpenseReimbursement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfficeExpenseReimbursement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
