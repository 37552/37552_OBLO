import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialRequest } from './material-request';

describe('MaterialRequest', () => {
  let component: MaterialRequest;
  let fixture: ComponentFixture<MaterialRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialRequest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaterialRequest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
