import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArrearReport } from './arrear-report';

describe('ArrearReport', () => {
  let component: ArrearReport;
  let fixture: ComponentFixture<ArrearReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArrearReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArrearReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
