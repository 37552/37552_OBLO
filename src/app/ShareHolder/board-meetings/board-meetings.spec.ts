import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardMeetings } from './board-meetings';

describe('BoardMeetings', () => {
  let component: BoardMeetings;
  let fixture: ComponentFixture<BoardMeetings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardMeetings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoardMeetings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
