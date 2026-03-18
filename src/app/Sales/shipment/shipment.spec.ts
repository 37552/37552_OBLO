import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Shipment } from './shipment';

describe('Shipment', () => {
  let component: Shipment;
  let fixture: ComponentFixture<Shipment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Shipment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Shipment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
