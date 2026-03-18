import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrmSettings } from './crm-settings';

describe('CrmSettings', () => {
  let component: CrmSettings;
  let fixture: ComponentFixture<CrmSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrmSettings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrmSettings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
