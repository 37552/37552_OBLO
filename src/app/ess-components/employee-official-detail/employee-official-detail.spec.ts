import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeOfficialDetail } from './employee-official-detail';

describe('EmployeeOfficialDetail', () => {
  let component: EmployeeOfficialDetail;
  let fixture: ComponentFixture<EmployeeOfficialDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeOfficialDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeOfficialDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
