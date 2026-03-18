import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TerritoryForm } from './territory-form';

describe('TerritoryForm', () => {
  let component: TerritoryForm;
  let fixture: ComponentFixture<TerritoryForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TerritoryForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TerritoryForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
