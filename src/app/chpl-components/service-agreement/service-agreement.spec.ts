import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceAgreement } from './service-agreement';

describe('ServiceAgreement', () => {
  let component: ServiceAgreement;
  let fixture: ComponentFixture<ServiceAgreement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceAgreement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceAgreement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
