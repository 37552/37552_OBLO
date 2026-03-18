import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderNew } from './purchase-order-new';

describe('PurchaseOrderNew', () => {
  let component: PurchaseOrderNew;
  let fixture: ComponentFixture<PurchaseOrderNew>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseOrderNew]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderNew);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
