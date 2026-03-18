import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductHierarchy } from './product-hierarchy';

describe('ProductHierarchy', () => {
  let component: ProductHierarchy;
  let fixture: ComponentFixture<ProductHierarchy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductHierarchy]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductHierarchy);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
