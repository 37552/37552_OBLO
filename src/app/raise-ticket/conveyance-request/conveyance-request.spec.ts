import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConveyanceRequest } from './conveyance-request';

describe('ConveyanceRequest', () => {
  let component: ConveyanceRequest;
  let fixture: ComponentFixture<ConveyanceRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConveyanceRequest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConveyanceRequest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
