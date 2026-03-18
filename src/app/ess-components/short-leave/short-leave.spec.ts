import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortLeave } from './short-leave';

describe('ShortLeave', () => {
  let component: ShortLeave;
  let fixture: ComponentFixture<ShortLeave>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShortLeave]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShortLeave);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
