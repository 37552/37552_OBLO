import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FnfSettlement } from './fnf-settlement';

describe('FnfSettlement', () => {
  let component: FnfSettlement;
  let fixture: ComponentFixture<FnfSettlement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FnfSettlement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FnfSettlement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
