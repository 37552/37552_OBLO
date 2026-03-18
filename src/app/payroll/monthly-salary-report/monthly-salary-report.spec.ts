import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlySalaryReport } from './monthly-salary-report';

describe('MonthlySalaryReport', () => {
  let component: MonthlySalaryReport;
  let fixture: ComponentFixture<MonthlySalaryReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlySalaryReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlySalaryReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
