import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Package } from './package';

describe('Package', () => {
  let component: Package;
  let fixture: ComponentFixture<Package>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Package]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Package);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
