import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternationalCommercialTerms } from './international-commercial-terms';

describe('InternationalCommercialTerms', () => {
  let component: InternationalCommercialTerms;
  let fixture: ComponentFixture<InternationalCommercialTerms>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InternationalCommercialTerms]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InternationalCommercialTerms);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
