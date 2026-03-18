import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourReimbursement } from './tour-reimbursement';

describe('TourReimbursement', () => {
  let component: TourReimbursement;
  let fixture: ComponentFixture<TourReimbursement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourReimbursement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TourReimbursement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
