import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseRequestApproval } from './purchase-request-approval';

describe('PurchaseRequestApproval', () => {
  let component: PurchaseRequestApproval;
  let fixture: ComponentFixture<PurchaseRequestApproval>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseRequestApproval]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseRequestApproval);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
