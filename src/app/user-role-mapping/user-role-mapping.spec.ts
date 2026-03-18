import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRoleMapping } from './user-role-mapping';

describe('UserRoleMapping', () => {
  let component: UserRoleMapping;
  let fixture: ComponentFixture<UserRoleMapping>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserRoleMapping]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserRoleMapping);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
