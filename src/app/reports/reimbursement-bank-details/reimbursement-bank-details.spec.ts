import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReimbursementBankDetails } from './reimbursement-bank-details';

describe('ReimbursementBankDetails', () => {
  let component: ReimbursementBankDetails;
  let fixture: ComponentFixture<ReimbursementBankDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReimbursementBankDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReimbursementBankDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
