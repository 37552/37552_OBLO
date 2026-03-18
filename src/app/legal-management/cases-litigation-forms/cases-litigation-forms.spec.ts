import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CasesLitigationForms } from './cases-litigation-forms';

describe('CasesLitigationForms', () => {
  let component: CasesLitigationForms;
  let fixture: ComponentFixture<CasesLitigationForms>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CasesLitigationForms]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CasesLitigationForms);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
