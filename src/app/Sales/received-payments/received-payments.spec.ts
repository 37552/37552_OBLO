import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivedPayments } from './received-payments';

describe('ReceivedPayments', () => {
  let component: ReceivedPayments;
  let fixture: ComponentFixture<ReceivedPayments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceivedPayments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceivedPayments);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
