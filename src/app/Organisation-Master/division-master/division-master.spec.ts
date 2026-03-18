import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DivisionMaster } from './division-master';

describe('DivisionMaster', () => {
  let component: DivisionMaster;
  let fixture: ComponentFixture<DivisionMaster>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DivisionMaster]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DivisionMaster);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
