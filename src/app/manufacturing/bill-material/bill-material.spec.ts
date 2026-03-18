import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillMaterial } from './bill-material';

describe('BillMaterial', () => {
  let component: BillMaterial;
  let fixture: ComponentFixture<BillMaterial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillMaterial]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillMaterial);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
