import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesReturn } from './sales-return';

describe('SalesReturn', () => {
  let component: SalesReturn;
  let fixture: ComponentFixture<SalesReturn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesReturn]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesReturn);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
