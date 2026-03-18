import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoticesForms } from './notices-forms';

describe('NoticesForms', () => {
  let component: NoticesForms;
  let fixture: ComponentFixture<NoticesForms>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoticesForms]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoticesForms);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
