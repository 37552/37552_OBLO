import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InspectionEntry } from './inspection-entry';

describe('InspectionEntry', () => {
  let component: InspectionEntry;
  let fixture: ComponentFixture<InspectionEntry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InspectionEntry]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InspectionEntry);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
