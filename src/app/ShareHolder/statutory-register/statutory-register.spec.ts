import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatutoryRegister } from './statutory-register';

describe('StatutoryRegister', () => {
  let component: StatutoryRegister;
  let fixture: ComponentFixture<StatutoryRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatutoryRegister]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatutoryRegister);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
