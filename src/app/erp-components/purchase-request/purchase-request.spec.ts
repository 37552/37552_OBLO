import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseRequest } from './purchase-request';

describe('PurchaseRequest', () => {
  let component: PurchaseRequest;
  let fixture: ComponentFixture<PurchaseRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseRequest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseRequest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
