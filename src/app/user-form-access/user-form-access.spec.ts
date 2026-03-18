import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserFormAccess } from './user-form-access';

describe('UserFormAccess', () => {
  let component: UserFormAccess;
  let fixture: ComponentFixture<UserFormAccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserFormAccess]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserFormAccess);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
