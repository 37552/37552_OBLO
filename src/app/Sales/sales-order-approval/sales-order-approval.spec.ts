import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesOrderApproval } from './sales-order-approval';

describe('SalesOrderApproval', () => {
  let component: SalesOrderApproval;
  let fixture: ComponentFixture<SalesOrderApproval>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesOrderApproval]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesOrderApproval);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
