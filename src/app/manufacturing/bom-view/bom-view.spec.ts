import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BomView } from './bom-view';

describe('BomView', () => {
  let component: BomView;
  let fixture: ComponentFixture<BomView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BomView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BomView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
