import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessMaster } from './business-master';

describe('BusinessMaster', () => {
  let component: BusinessMaster;
  let fixture: ComponentFixture<BusinessMaster>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessMaster]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusinessMaster);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
