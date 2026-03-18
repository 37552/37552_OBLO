import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenderApproval } from './tender-approval';

describe('TenderApproval', () => {
  let component: TenderApproval;
  let fixture: ComponentFixture<TenderApproval>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenderApproval]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TenderApproval);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
