import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MsmeSettings } from './msme-settings';

describe('MsmeSettings', () => {
  let component: MsmeSettings;
  let fixture: ComponentFixture<MsmeSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MsmeSettings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MsmeSettings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
