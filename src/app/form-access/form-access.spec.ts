import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormAccess } from './form-access';

describe('FormAccess', () => {
  let component: FormAccess;
  let fixture: ComponentFixture<FormAccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormAccess]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormAccess);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
