import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseMaster } from './warehouse-master';

describe('WarehouseMaster', () => {
  let component: WarehouseMaster;
  let fixture: ComponentFixture<WarehouseMaster>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WarehouseMaster]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WarehouseMaster);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
