import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderApproval } from './purchase-order-approval';

describe('PurchaseOrderApproval', () => {
  let component: PurchaseOrderApproval;
  let fixture: ComponentFixture<PurchaseOrderApproval>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseOrderApproval]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderApproval);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
