import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderOtherCharges } from './purchase-order-other-charges';

describe('PurchaseOrderOtherCharges', () => {
  let component: PurchaseOrderOtherCharges;
  let fixture: ComponentFixture<PurchaseOrderOtherCharges>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseOrderOtherCharges]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderOtherCharges);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
