import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesOrderAmendment } from './sales-order-amendment';

describe('SalesOrderAmendment', () => {
  let component: SalesOrderAmendment;
  let fixture: ComponentFixture<SalesOrderAmendment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesOrderAmendment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesOrderAmendment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
