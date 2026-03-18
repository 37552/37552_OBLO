import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrmCustomerSrDashboard } from './crm-customer-sr-dashboard';

describe('CrmCustomerSrDashboard', () => {
  let component: CrmCustomerSrDashboard;
  let fixture: ComponentFixture<CrmCustomerSrDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrmCustomerSrDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrmCustomerSrDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
