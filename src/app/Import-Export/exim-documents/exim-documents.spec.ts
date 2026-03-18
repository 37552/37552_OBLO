import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EximDocuments } from './exim-documents';

describe('EximDocuments', () => {
  let component: EximDocuments;
  let fixture: ComponentFixture<EximDocuments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EximDocuments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EximDocuments);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
