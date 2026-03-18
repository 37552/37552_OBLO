import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlySalaryPreparation } from './monthly-salary-preparation';

describe('MonthlySalaryPreparation', () => {
  let component: MonthlySalaryPreparation;
  let fixture: ComponentFixture<MonthlySalaryPreparation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlySalaryPreparation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlySalaryPreparation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
