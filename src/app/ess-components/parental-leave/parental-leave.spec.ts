import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentalLeave } from './parental-leave';

describe('ParentalLeave', () => {
  let component: ParentalLeave;
  let fixture: ComponentFixture<ParentalLeave>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParentalLeave]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParentalLeave);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
