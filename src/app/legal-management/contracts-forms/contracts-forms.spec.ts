import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractsForms } from './contracts-forms';

describe('ContractsForms', () => {
  let component: ContractsForms;
  let fixture: ComponentFixture<ContractsForms>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractsForms]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContractsForms);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
