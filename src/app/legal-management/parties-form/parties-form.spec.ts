import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartiesForm } from './parties-form';

describe('PartiesForm', () => {
  let component: PartiesForm;
  let fixture: ComponentFixture<PartiesForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartiesForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartiesForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
