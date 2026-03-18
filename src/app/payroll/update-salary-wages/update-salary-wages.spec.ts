import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateSalaryWages } from './update-salary-wages';

describe('UpdateSalaryWages', () => {
  let component: UpdateSalaryWages;
  let fixture: ComponentFixture<UpdateSalaryWages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateSalaryWages]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateSalaryWages);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
