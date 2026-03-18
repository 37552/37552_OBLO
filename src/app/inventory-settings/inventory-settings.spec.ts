import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventorySettings } from './inventory-settings';

describe('InventorySettings', () => {
  let component: InventorySettings;
  let fixture: ComponentFixture<InventorySettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventorySettings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventorySettings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
