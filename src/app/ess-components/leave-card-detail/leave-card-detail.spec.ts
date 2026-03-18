import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveCardDetail } from './leave-card-detail';

describe('LeaveCardDetail', () => {
  let component: LeaveCardDetail;
  let fixture: ComponentFixture<LeaveCardDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveCardDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveCardDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
