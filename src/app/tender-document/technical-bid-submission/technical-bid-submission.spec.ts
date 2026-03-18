import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnicalBidSubmission } from './technical-bid-submission';

describe('TechnicalBidSubmission', () => {
  let component: TechnicalBidSubmission;
  let fixture: ComponentFixture<TechnicalBidSubmission>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnicalBidSubmission]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TechnicalBidSubmission);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
