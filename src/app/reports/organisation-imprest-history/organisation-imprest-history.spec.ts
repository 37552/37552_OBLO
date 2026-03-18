import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganisationImprestHistory } from './organisation-imprest-history';

describe('OrganisationImprestHistory', () => {
  let component: OrganisationImprestHistory;
  let fixture: ComponentFixture<OrganisationImprestHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganisationImprestHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganisationImprestHistory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
