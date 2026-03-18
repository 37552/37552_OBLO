import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppraisalPeriod } from './appraisal-period';

describe('AppraisalPeriod', () => {
  let component: AppraisalPeriod;
  let fixture: ComponentFixture<AppraisalPeriod>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppraisalPeriod]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppraisalPeriod);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
