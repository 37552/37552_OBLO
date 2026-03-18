import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenderClosure } from './tender-closure';

describe('TenderClosure', () => {
  let component: TenderClosure;
  let fixture: ComponentFixture<TenderClosure>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenderClosure]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TenderClosure);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
