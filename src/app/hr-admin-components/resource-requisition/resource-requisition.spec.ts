import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceRequisition } from './resource-requisition';

describe('ResourceRequisition', () => {
  let component: ResourceRequisition;
  let fixture: ComponentFixture<ResourceRequisition>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourceRequisition]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResourceRequisition);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
