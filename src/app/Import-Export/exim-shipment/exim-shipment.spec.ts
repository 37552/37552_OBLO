import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EximShipment } from './exim-shipment';

describe('EximShipment', () => {
  let component: EximShipment;
  let fixture: ComponentFixture<EximShipment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EximShipment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EximShipment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
