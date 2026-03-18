import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrmContract } from './crm-contract';

describe('CrmContract', () => {
  let component: CrmContract;
  let fixture: ComponentFixture<CrmContract>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrmContract]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrmContract);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
