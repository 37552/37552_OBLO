import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LetterOfAcceptance } from './letter-of-acceptance';

describe('LetterOfAcceptance', () => {
  let component: LetterOfAcceptance;
  let fixture: ComponentFixture<LetterOfAcceptance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LetterOfAcceptance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LetterOfAcceptance);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
