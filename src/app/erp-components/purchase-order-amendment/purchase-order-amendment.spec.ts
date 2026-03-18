import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderAmendment } from './purchase-order-amendment';

describe('PurchaseOrderAmendment', () => {
  let component: PurchaseOrderAmendment;
  let fixture: ComponentFixture<PurchaseOrderAmendment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseOrderAmendment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderAmendment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
