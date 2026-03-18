import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Shiftmaster } from './shiftmaster';

describe('Shiftmaster', () => {
  let component: Shiftmaster;
  let fixture: ComponentFixture<Shiftmaster>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Shiftmaster]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Shiftmaster);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
