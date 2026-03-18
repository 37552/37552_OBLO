import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeImprestHistory } from './employee-imprest-history';

describe('EmployeeImprestHistory', () => {
  let component: EmployeeImprestHistory;
  let fixture: ComponentFixture<EmployeeImprestHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeImprestHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeImprestHistory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
