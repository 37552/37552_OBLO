import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HolidayMaster } from './holiday-master';

describe('HolidayMaster', () => {
  let component: HolidayMaster;
  let fixture: ComponentFixture<HolidayMaster>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HolidayMaster]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HolidayMaster);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
