import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryChalan } from './delivery-chalan';

describe('DeliveryChalan', () => {
  let component: DeliveryChalan;
  let fixture: ComponentFixture<DeliveryChalan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryChalan]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveryChalan);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
