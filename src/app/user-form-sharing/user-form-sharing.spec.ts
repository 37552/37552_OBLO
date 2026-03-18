import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserFormSharing } from './user-form-sharing';

describe('UserFormSharing', () => {
  let component: UserFormSharing;
  let fixture: ComponentFixture<UserFormSharing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserFormSharing]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserFormSharing);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
