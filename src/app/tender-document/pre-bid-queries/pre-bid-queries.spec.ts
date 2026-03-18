import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreBidQueries } from './pre-bid-queries';

describe('PreBidQueries', () => {
  let component: PreBidQueries;
  let fixture: ComponentFixture<PreBidQueries>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreBidQueries]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreBidQueries);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
