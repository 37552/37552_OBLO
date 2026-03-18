import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputTypeMaster } from './input-type-master';

describe('InputTypeMaster', () => {
  let component: InputTypeMaster;
  let fixture: ComponentFixture<InputTypeMaster>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputTypeMaster]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputTypeMaster);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
