import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganisationProfile } from './organisation-profile';

describe('OrganisationProfile', () => {
  let component: OrganisationProfile;
  let fixture: ComponentFixture<OrganisationProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganisationProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganisationProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
