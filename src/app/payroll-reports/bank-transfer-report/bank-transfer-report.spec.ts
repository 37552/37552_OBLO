import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankTransferReport } from './bank-transfer-report';

describe('BankTransferReport', () => {
  let component: BankTransferReport;
  let fixture: ComponentFixture<BankTransferReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BankTransferReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BankTransferReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
