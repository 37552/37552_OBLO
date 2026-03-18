import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessVerticalsForm } from './business-verticals-form';

describe('BusinessVerticalsForm', () => {
  let component: BusinessVerticalsForm;
  let fixture: ComponentFixture<BusinessVerticalsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessVerticalsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusinessVerticalsForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
