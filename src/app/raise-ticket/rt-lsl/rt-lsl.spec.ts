import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RtLsl } from './rt-lsl';

describe('RtLsl', () => {
  let component: RtLsl;
  let fixture: ComponentFixture<RtLsl>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RtLsl]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RtLsl);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
