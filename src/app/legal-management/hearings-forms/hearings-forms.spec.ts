import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HearingsForms } from './hearings-forms';

describe('HearingsForms', () => {
  let component: HearingsForms;
  let fixture: ComponentFixture<HearingsForms>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HearingsForms]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HearingsForms);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
