import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrmOpportunities } from './crm-opportunities';

describe('CrmOpportunities', () => {
  let component: CrmOpportunities;
  let fixture: ComponentFixture<CrmOpportunities>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrmOpportunities]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrmOpportunities);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
