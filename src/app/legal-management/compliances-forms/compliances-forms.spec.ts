import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompliancesForms } from './compliances-forms';

describe('CompliancesForms', () => {
  let component: CompliancesForms;
  let fixture: ComponentFixture<CompliancesForms>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompliancesForms]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompliancesForms);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
