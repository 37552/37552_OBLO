import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BonusAccural } from './bonus-accural';

describe('BonusAccural', () => {
  let component: BonusAccural;
  let fixture: ComponentFixture<BonusAccural>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BonusAccural]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BonusAccural);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
