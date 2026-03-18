import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomClearance } from './custom-clearance';

describe('CustomClearance', () => {
  let component: CustomClearance;
  let fixture: ComponentFixture<CustomClearance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomClearance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomClearance);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
