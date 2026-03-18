import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoutingMaster } from './routing-master';

describe('RoutingMaster', () => {
  let component: RoutingMaster;
  let fixture: ComponentFixture<RoutingMaster>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoutingMaster]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoutingMaster);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
