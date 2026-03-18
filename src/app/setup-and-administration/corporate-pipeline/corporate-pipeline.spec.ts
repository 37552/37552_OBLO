import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorporatePipeline } from './corporate-pipeline';

describe('CorporatePipeline', () => {
  let component: CorporatePipeline;
  let fixture: ComponentFixture<CorporatePipeline>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CorporatePipeline]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CorporatePipeline);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
