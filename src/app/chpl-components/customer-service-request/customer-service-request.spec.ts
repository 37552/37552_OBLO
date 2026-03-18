import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerServiceRequest } from './customer-service-request';

describe('CustomerServiceRequest', () => {
  let component: CustomerServiceRequest;
  let fixture: ComponentFixture<CustomerServiceRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerServiceRequest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerServiceRequest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
