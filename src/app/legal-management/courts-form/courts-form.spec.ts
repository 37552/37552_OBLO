import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourtsForm } from './courts-form';

describe('CourtsForm', () => {
  let component: CourtsForm;
  let fixture: ComponentFixture<CourtsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourtsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourtsForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
