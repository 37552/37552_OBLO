import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EximDocumentTracker } from './exim-document-tracker';

describe('EximDocumentTracker', () => {
  let component: EximDocumentTracker;
  let fixture: ComponentFixture<EximDocumentTracker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EximDocumentTracker]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EximDocumentTracker);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
