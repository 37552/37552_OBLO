import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorProfile } from './vendor-profile';

describe('VendorProfile', () => {
  let component: VendorProfile;
  let fixture: ComponentFixture<VendorProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
