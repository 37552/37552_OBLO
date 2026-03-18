import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeePerformanceMember } from './employee-performance-member';

describe('EmployeePerformanceMember', () => {
  let component: EmployeePerformanceMember;
  let fixture: ComponentFixture<EmployeePerformanceMember>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeePerformanceMember]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeePerformanceMember);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
