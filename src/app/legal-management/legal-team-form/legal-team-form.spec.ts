import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalTeamForm } from './legal-team-form';

describe('LegalTeamForm', () => {
  let component: LegalTeamForm;
  let fixture: ComponentFixture<LegalTeamForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegalTeamForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LegalTeamForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
