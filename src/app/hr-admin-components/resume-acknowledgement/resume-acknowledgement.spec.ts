import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumeAcknowledgement } from './resume-acknowledgement';

describe('ResumeAcknowledgement', () => {
  let component: ResumeAcknowledgement;
  let fixture: ComponentFixture<ResumeAcknowledgement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumeAcknowledgement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResumeAcknowledgement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
