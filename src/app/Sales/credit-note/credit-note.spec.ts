import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditNote } from './credit-note';

describe('CreditNote', () => {
  let component: CreditNote;
  let fixture: ComponentFixture<CreditNote>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditNote]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditNote);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
