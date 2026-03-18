import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficeRequest } from './office-request';

describe('OfficeRequest', () => {
  let component: OfficeRequest;
  let fixture: ComponentFixture<OfficeRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfficeRequest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfficeRequest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
