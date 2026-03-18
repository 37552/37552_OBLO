import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialBid } from './financial-bid';

describe('FinancialBid', () => {
  let component: FinancialBid;
  let fixture: ComponentFixture<FinancialBid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialBid]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinancialBid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
