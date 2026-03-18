import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BinLocationMaster } from './bin-location-master';

describe('BinLocationMaster', () => {
  let component: BinLocationMaster;
  let fixture: ComponentFixture<BinLocationMaster>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BinLocationMaster]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BinLocationMaster);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
