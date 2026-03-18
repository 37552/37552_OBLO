import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErpDashboard } from './erp-dashboard';

describe('ErpDashboard', () => {
  let component: ErpDashboard;
  let fixture: ComponentFixture<ErpDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErpDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErpDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
