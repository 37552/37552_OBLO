import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxExemption } from './tax-exemption';

describe('TaxExemption', () => {
  let component: TaxExemption;
  let fixture: ComponentFixture<TaxExemption>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaxExemption]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaxExemption);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
