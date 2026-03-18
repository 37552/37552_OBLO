import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GatePassNew } from './gate-pass-new';

describe('GatePassNew', () => {
  let component: GatePassNew;
  let fixture: ComponentFixture<GatePassNew>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GatePassNew]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GatePassNew);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
