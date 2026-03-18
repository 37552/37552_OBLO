import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseSettingsComponent } from './purchase-settings';

describe('PurchaseSettings', () => {
  let component: PurchaseSettingsComponent;
  let fixture: ComponentFixture<PurchaseSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
