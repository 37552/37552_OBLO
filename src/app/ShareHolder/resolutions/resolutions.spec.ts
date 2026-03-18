import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Resolutions } from './resolutions';

describe('Resolutions', () => {
  let component: Resolutions;
  let fixture: ComponentFixture<Resolutions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Resolutions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Resolutions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
