import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompleteJobs } from './complete-jobs';

describe('CompleteJobs', () => {
  let component: CompleteJobs;
  let fixture: ComponentFixture<CompleteJobs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompleteJobs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompleteJobs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
