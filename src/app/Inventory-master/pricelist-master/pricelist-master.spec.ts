import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PricelistMaster } from './pricelist-master';

describe('PricelistMaster', () => {
  let component: PricelistMaster;
  let fixture: ComponentFixture<PricelistMaster>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PricelistMaster]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PricelistMaster);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
