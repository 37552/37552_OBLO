import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionPlan } from './production-plan';

describe('ProductionPlan', () => {
  let component: ProductionPlan;
  let fixture: ComponentFixture<ProductionPlan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductionPlan]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductionPlan);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
