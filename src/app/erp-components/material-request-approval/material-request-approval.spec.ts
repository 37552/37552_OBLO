import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialRequestApproval } from './material-request-approval';

describe('MaterialRequestApproval', () => {
  let component: MaterialRequestApproval;
  let fixture: ComponentFixture<MaterialRequestApproval>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialRequestApproval]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaterialRequestApproval);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
