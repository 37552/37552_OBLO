import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenderDetails } from './tender-details';

describe('TenderDetails', () => {
  let component: TenderDetails;
  let fixture: ComponentFixture<TenderDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenderDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TenderDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
