import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserHierarchyFlow } from './user-hierarchy-flow';

describe('UserHierarchyFlow', () => {
  let component: UserHierarchyFlow;
  let fixture: ComponentFixture<UserHierarchyFlow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserHierarchyFlow]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserHierarchyFlow);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
