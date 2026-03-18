import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompliancesActivitiesForms } from './compliances-activities-forms';

describe('CompliancesActivitiesForms', () => {
  let component: CompliancesActivitiesForms;
  let fixture: ComponentFixture<CompliancesActivitiesForms>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompliancesActivitiesForms]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompliancesActivitiesForms);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
