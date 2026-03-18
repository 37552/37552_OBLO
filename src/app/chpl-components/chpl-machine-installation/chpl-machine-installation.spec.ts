import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChplMachineInstallation } from './chpl-machine-installation';

describe('ChplMachineInstallation', () => {
  let component: ChplMachineInstallation;
  let fixture: ComponentFixture<ChplMachineInstallation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChplMachineInstallation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChplMachineInstallation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
