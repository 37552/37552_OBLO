import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseRequest } from './expense-request';

describe('ExpenseRequest', () => {
  let component: ExpenseRequest;
  let fixture: ComponentFixture<ExpenseRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseRequest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseRequest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
