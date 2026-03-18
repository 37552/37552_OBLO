import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesReturnApproval } from './sales-return-approval';

describe('SalesReturnApproval', () => {
  let component: SalesReturnApproval;
  let fixture: ComponentFixture<SalesReturnApproval>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesReturnApproval]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesReturnApproval);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
