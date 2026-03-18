import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HolidayCalenderMaster } from './holiday-calender-master';

describe('HolidayCalenderMaster', () => {
  let component: HolidayCalenderMaster;
  let fixture: ComponentFixture<HolidayCalenderMaster>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HolidayCalenderMaster]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HolidayCalenderMaster);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
