import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Branchmaster } from './branchmaster';

describe('Branchmaster', () => {
  let component: Branchmaster;
  let fixture: ComponentFixture<Branchmaster>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Branchmaster]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Branchmaster);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
