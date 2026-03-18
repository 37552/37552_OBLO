import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationMaster } from './location-master';

describe('LocationMaster', () => {
  let component: LocationMaster;
  let fixture: ComponentFixture<LocationMaster>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationMaster]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocationMaster);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
