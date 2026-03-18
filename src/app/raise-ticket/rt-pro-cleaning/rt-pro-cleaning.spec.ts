import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RtProCleaning } from './rt-pro-cleaning';

describe('RtProCleaning', () => {
  let component: RtProCleaning;
  let fixture: ComponentFixture<RtProCleaning>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RtProCleaning]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RtProCleaning);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
