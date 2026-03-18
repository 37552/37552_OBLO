import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxRate } from './tax-rate';

describe('TaxRate', () => {
  let component: TaxRate;
  let fixture: ComponentFixture<TaxRate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaxRate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaxRate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
