import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrmQuotation } from './crm-quotation';

describe('CrmQuotation', () => {
  let component: CrmQuotation;
  let fixture: ComponentFixture<CrmQuotation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrmQuotation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrmQuotation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
