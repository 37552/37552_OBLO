import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnicalBidEvaluation } from './technical-bid-evaluation';

describe('TechnicalBidEvaluation', () => {
  let component: TechnicalBidEvaluation;
  let fixture: ComponentFixture<TechnicalBidEvaluation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnicalBidEvaluation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TechnicalBidEvaluation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
