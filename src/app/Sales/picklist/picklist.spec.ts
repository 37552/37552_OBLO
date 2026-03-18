import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Picklist } from './picklist';

describe('Picklist', () => {
  let component: Picklist;
  let fixture: ComponentFixture<Picklist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Picklist]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Picklist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
