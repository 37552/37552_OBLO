import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlySalaryApproval } from './monthly-salary-approval';

describe('MonthlySalaryApproval', () => {
  let component: MonthlySalaryApproval;
  let fixture: ComponentFixture<MonthlySalaryApproval>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlySalaryApproval]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlySalaryApproval);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
