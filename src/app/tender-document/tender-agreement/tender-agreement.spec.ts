import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenderAgreement } from './tender-agreement';

describe('TenderAgreement', () => {
  let component: TenderAgreement;
  let fixture: ComponentFixture<TenderAgreement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenderAgreement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TenderAgreement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
