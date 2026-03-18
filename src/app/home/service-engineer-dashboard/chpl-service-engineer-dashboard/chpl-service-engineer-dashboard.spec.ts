import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChplServiceEngineerDashboard } from './chpl-service-engineer-dashboard';

describe('ChplServiceEngineerDashboard', () => {
  let component: ChplServiceEngineerDashboard;
  let fixture: ComponentFixture<ChplServiceEngineerDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChplServiceEngineerDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChplServiceEngineerDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
