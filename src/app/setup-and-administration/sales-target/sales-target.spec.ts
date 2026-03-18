import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesTarget } from './sales-target';

describe('SalesTarget', () => {
  let component: SalesTarget;
  let fixture: ComponentFixture<SalesTarget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesTarget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesTarget);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
