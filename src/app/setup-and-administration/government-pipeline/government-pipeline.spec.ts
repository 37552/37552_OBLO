import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GovernmentPipeline } from './government-pipeline';

describe('GovernmentPipeline', () => {
  let component: GovernmentPipeline;
  let fixture: ComponentFixture<GovernmentPipeline>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GovernmentPipeline]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GovernmentPipeline);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
