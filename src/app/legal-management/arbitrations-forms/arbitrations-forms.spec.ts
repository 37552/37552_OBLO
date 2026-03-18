import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArbitrationsForms } from './arbitrations-forms';

describe('ArbitrationsForms', () => {
  let component: ArbitrationsForms;
  let fixture: ComponentFixture<ArbitrationsForms>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArbitrationsForms]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArbitrationsForms);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
