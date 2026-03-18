import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EsicReturnReport } from './esic-return-report';

describe('EsicReturnReport', () => {
  let component: EsicReturnReport;
  let fixture: ComponentFixture<EsicReturnReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EsicReturnReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EsicReturnReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
