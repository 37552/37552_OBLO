import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationsMaster } from './operations-master';

describe('OperationsMaster', () => {
  let component: OperationsMaster;
  let fixture: ComponentFixture<OperationsMaster>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperationsMaster]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperationsMaster);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
