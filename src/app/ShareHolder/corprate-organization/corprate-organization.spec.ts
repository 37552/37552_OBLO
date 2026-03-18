import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorprateOrganization } from './corprate-organization';

describe('CorprateOrganization', () => {
  let component: CorprateOrganization;
  let fixture: ComponentFixture<CorprateOrganization>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CorprateOrganization]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CorprateOrganization);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
