import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubContracting } from './sub-contracting';

describe('SubContracting', () => {
  let component: SubContracting;
  let fixture: ComponentFixture<SubContracting>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubContracting]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubContracting);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
