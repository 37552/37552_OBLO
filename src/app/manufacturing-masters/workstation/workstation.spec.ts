import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Workstation } from './workstation';

describe('Workstation', () => {
  let component: Workstation;
  let fixture: ComponentFixture<Workstation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Workstation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Workstation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
