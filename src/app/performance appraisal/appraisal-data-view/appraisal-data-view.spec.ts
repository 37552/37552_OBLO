import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppraisalDataView } from './appraisal-data-view';

describe('AppraisalDataView', () => {
  let component: AppraisalDataView;
  let fixture: ComponentFixture<AppraisalDataView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppraisalDataView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppraisalDataView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
