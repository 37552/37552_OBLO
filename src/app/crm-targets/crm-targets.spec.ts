import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrmTargets } from './crm-targets';

describe('CrmTargets', () => {
  let component: CrmTargets;
  let fixture: ComponentFixture<CrmTargets>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrmTargets]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrmTargets);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
