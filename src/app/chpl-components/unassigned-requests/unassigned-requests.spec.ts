import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnassignedRequests } from './unassigned-requests';

describe('UnassignedRequests', () => {
  let component: UnassignedRequests;
  let fixture: ComponentFixture<UnassignedRequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnassignedRequests]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnassignedRequests);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
