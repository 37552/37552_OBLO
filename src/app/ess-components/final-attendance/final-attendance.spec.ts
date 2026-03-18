import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalAttendance } from './final-attendance';

describe('FinalAttendance', () => {
  let component: FinalAttendance;
  let fixture: ComponentFixture<FinalAttendance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinalAttendance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinalAttendance);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
