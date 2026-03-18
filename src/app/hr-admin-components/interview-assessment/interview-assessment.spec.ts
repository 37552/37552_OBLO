import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewAssessment } from './interview-assessment';

describe('InterviewAssessment', () => {
  let component: InterviewAssessment;
  let fixture: ComponentFixture<InterviewAssessment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewAssessment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewAssessment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
